---
title: 你的Kubernetes Java应用优雅停机了吗？
toc: true
tags:
  - Kubernetes, Java
category:
  - null
date: 2021-01-15 18:02:07
thumbnail:
---

假如我们从 kafka 拉取数据然后生成任务处理数据，在服务退出时，如何保证内存中的数据能被正常处理完不丢失呢？假如服务是部署在 `Kubernetes` 中又该如何处理？
<!--more-->

# Java 应用优雅停机
我们首先考虑下，一般在什么场景下数据会丢失呢？

* 升级服务时
* pod重启时
* 服务器断电时

因为服务器断电属于极端情况，我们暂且不考虑。那就只有 Java 退出时我们要保证数据的完整性了。在 Java 中，有一个方法可以实现应用退出时候的优雅停机：`shutdown hook`。`Spring boot`把这个东西封装了一下，可以通过 `@PreDestroy` 注解实现。当 `JVM` 收到退出的信号时，会调用 `shutdown hook` 中的方法，完成清理操作。示例代码如下：


```java
Runtime.getRuntime().addShutdownHook(new Thread() {
	@Override
	public void run() {
		System.out.println("Start to run shutdown hook.");
	}
})
``` 


`Shutdown hook` 可以保证在我们代码主动调用 `System.exit()`， `OOM`， 在终端执行 `Ctrl+C`，以及应用主动关闭等情况下时被调用。在实际的场景中，我们可以在上述的线程中执行清理操作。比如，停止 kafka 的数据消费，以及任务的及时处理等。

当我们使用 `java -jar *.jar` 运行 `Java`程序后，通过执行 `kill $pid`，可以发现程序确实可以优雅退出。但是当我把服务部署到 `Kubernetes` 时，发现这个逻辑并没有被执行，到底哪里出了问题？


# 在 Kubernetes 中优雅停机
当我们发送 `delete` 命令给 `pod` 时，`Kubernetes` 会使用优雅停机（默认30s时间），在优雅停机过程中，此 `pod`在 `API server` 中会被更新为`dead`状态。当我们用`kubectl` 命令查看此`pod`时，它被展示为`Terminating` 的状态。当 `Kubelet` 看到 `pod`被标记为了 `Terminating` 状态时，它就会开始执行 `pod` 的 `shutdown` 程序。如果我们 pod 的容器定义了 `preStop hook`，那么这个 hook 会在容器中执行；与此同时，`Kubelet` 会向容器内发送一个`TERM`信号。`Service`也会将此 pod 从 endpoint 列表移除。当优雅停机时间过后，在 `pod` 里仍然存活的进程则会被`SIGKILL`命令杀掉。`Kubelet`会在 `API server` 里通过设置 `grace period=0`（立即删除）来完成 Pod 的删除操作。删除后此 Pod 会在API中消失，并且在客户端也不可见了。

以上，可以看出，我们的容器是会收到 `TERM` 信号的，按照常理，如果我们的 `Java` 进程收到了 `TERM` 信号是可以正常执行我们写的 `shutdown hook` 优雅退出的，但是这里却没有执行，很有可能是我们的 `Java` 进程根本就没有收到信号。

查看我们的 `Dockerfile`，发现我们定义的启动命令是执行一个 `run.sh` 的脚本，在 `run.sh` 脚本中，进一步执行了启动 `Java` 进程的命令。

```bash(run.sh)
# run.sh
...
sh start.sh start
...
while [1]
do 
	sleep 30
done
```

可以看到，我们在 `run.sh` 中进一步执行了 `start.sh`，Java 进程的启动逻辑在`start.sh`脚本中。我们可以执行 `ps -ef` 查看下当前容器中的进程

```bash
UID		PID		PPID	C 	STIME 		TTY 	TIME 		CMD
root	1		0		0	11:01		?		00:00:00	bash ~/run.sh	
root	4084	1		8	11:01		?		00:15:00	java -Dname=test
root	14913	1		0	13:49		?		00:00:00	sleep 30
root	14914	0		0	13:50		pts/0	00:00:00	bash
root	14955	14914	0	13:50		pts/0	00:00:00	ps -ef
```

可以看到，我们运行的 `run.sh` 的 PID 是 `1`，Java 进程的 PID 是 4084，Java 进程是 `run.sh` 进程的一个子进程。问题就出在这里，在 pod 被删除时，`TERM` 信号只会发送给 `1号`进程，而 `run.sh` 接收到此信号后并不会将其转发给 Java 进程，因此 Java 便无法触发 `shutdown hook`，无法实现优雅退出。最终，Java 是被 `SIGKILL` 信号杀掉的（强制退出）。所以，我们只需要让 Java 进程作为 `1号`进程就行了。改写下脚本，我们把启动 Java 进程的命令放到 `run.sh` 中

```bash
# run.sh
...
exec java $JAVA_OPTS -jar ./*.jar --server.port=8080
...
while [1]
do 
	sleep 30
done
```

`exec` 的作用是被执行的命令行替换掉当前的 `shell` 进程。测试发现 OK，此时我们实现了优雅停机。但是，这足够优雅吗？

# 更优雅地停机
在上一步，我们实现了优雅停机，但是其实这并不是最优方案。我在看 `start.sh` 脚本中，发现此脚本定义了 `start, restart, stop, status` 4个方法，而且这个脚本中定义了很多额外的变量，如果我们要把之前的功能都实现的话，就需要把逻辑都搬到 `run.sh` 中。这无疑会增大工作量，这是不优雅的原因之一。

其次，一般是不推荐把 `Java 进程`作为`1号`进程的。因为在 `Linux`中，`1号`进程有特殊作用：`1号`进程会作为孤儿进程的父进程，它需要对自己的子进程进行清理回收，避免系统产生僵尸进程。`bash`可以很好地处理这种清理工作，我们一般自己写的 Java 程序是不会考虑这种东西的。

那么，就需要我们在 `shell` 中接收到 `TERM` 信号后把信号传递给 Java 进程了。这需要怎么做呢？我们需要使用`trap`命令。`trap` 命令的作用是捕捉信号和其他事件并执行命令。

```bash
# run.sh
...
sh start.sh start

grace_exit() {
	echo 'grace exit started'
	sh start.sh stop &
	wait $!
	echo 'grace exit finished'
}
trap 'grace_exit' TERM INT
...
while [1]
do 
	sleep 30
done
```

在脚本中，我们使用 `trap` 捕捉 `TERM`（`Kubelet` 发送的信号） 和 `INT`（快速关闭，当用户输入 `Control-C`时由终端程序发送） 信号，捕捉到了以后，我们执行了 `grace_exit` 方法，在此方法中，调用了 `start.sh` 脚本的 `stop` 方法，其实这个 `stop` 方法就是找到了 Java 进程，然后给其发送了 kill 命令，我们直接在 `grace_exit` 中执行相同逻辑也是可以的，这里是为了复用逻辑。我们还使用了 `&` 保证 `stop` 方法在后台运行，这样方便我们获取其进程号（`$!`会返回`shell`最后运行的后台进程的 PID），等待其执行结束。 这样，当我们 `delete``pod` 时，`Kubelet` 发送 `TERM` 信号后，我们就能传达给 Java 进程，进而让 Java 进程进行优雅停机了。

---
> **标题**：[你的Kubernetes Java应用优雅停机了吗？](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[你的Kubernetes Java应用优雅停机了吗？](https://dengkaiting.com/)
> **时间**：{{ date }}
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。