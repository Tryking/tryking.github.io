---
title: xargs 知多少？
toc: true
tags:
  - Shell
category:
  - Shell
date: 2020-03-20 00:42:16
h:
---

有了 `xargs` 神器，再也不用担心 `Linux` 上的数据操作了。
<!--more-->
# 由来
假如我们想查找当前服务器上运行的 `Python` 应用，并且列出它们的进程 `id`，我们可以使用 `awk` 命令进行操作。

```
ps aux | grep python | awk -F " " '{print $2}'
```
![01.png](http://media.dengkaiting.com/xargs/01.png)

查出来后，假如我们又想要把这些进程给强制删除呢？我想到了直接用 `kill -9 进程ID`，我们来试一下。
![fec0d67f-5bf9-4214-519c-dd0f4c994569.png](http://media.dengkaiting.com/xargs/fec0d67f-5bf9-4214-519c-dd0f4c994569.png)

在这里，我命令后面直接跟了 `kill -9`，`进程 ID` 我以为管道符能直接给我传过来，但是并没有，这是咋回事？

其实，在 `Linux` 命令中，大多数命令都不接受标准输入作为参数，只能在命令后直接跟上参数，这就导致我们无法使用管道符进行参数的传递。同样的命令还有 `echo` 等。

这时，我们的 `xargs` 就可以派上用场了，`xargs` 的作用就是将标准输入转为命令行参数。对于上面的场景，我们可以这样做 `ps aux | grep python | grep -v grep | awk -F " " '{print $2}'| xargs kill -9`

![d818efeb-543c-a70e-cba7-c65bf3f5e7dd.png](http://media.dengkaiting.com/xargs/d818efeb-543c-a70e-cba7-c65bf3f5e7dd.png)

执行命令后，什么都没输出。我们继续执行查询命令查找 `Python` 进程，可以看到，进程已经都被杀掉了。

# 详细介绍

`xargs` 命令的格式为 `xargs [-option] [command]`，最终真正执行的命令是 `command`，它接受来自 `xargs` 的传递的参数。`command` 可以缺省，默认为 `echo`。

![26fa39e3-29a6-2373-7e90-db24db9af5c2.png](http://media.dengkaiting.com/xargs/26fa39e3-29a6-2373-7e90-db24db9af5c2.png)

# 进阶使用

## -p 参数 / -t 参数
有时候我们的 `command` 命令比较复杂时我们可能想要知道最终到底执行什么操作，这时我们可以加上 `-p` 参数，加上后会打印出最终执行的命令，让我们来确认是否执行。
![9c0b1cf5-be83-4dbb-b726-1d4378759d09.png](http://media.dengkaiting.com/xargs/9c0b1cf5-be83-4dbb-b726-1d4378759d09.png)

如果使用 `-t` 参数的话会直接打印命令并执行，不会询问我们。
![47a99e44-11e7-380e-87e3-4c1f8bfb8285.png](http://media.dengkaiting.com/xargs/47a99e44-11e7-380e-87e3-4c1f8bfb8285.png)

## -I 参数
如果我们的命令需要多次使用命令行参数时，我们可以使用 `-I` 参数，`-I` 后面跟的是命令行参数的替代字符串。比如

![bdc6cdf9-da00-3b5b-acd6-c1e3e78ba58d.png](http://media.dengkaiting.com/xargs/bdc6cdf9-da00-3b5b-acd6-c1e3e78ba58d.png)

在命令中，我们使用 `-I {}` 指定了 `{}` 作为我们的命令行参数，紧接着使用了 `-n 1`，它表示我们指定将每一项执行一次命令。最后我们执行 `sh` 命令输出了命令行参数，并创建了对应的文件。

以上就是一些常用的参数，如果还想了解更多，可以使用 `man xargs`，毕竟，自己动手，丰衣足食。 -_-

![26d35b8f-2ecf-2087-6ac7-c7cb9c362c60.png](http://media.dengkaiting.com/xargs/26d35b8f-2ecf-2087-6ac7-c7cb9c362c60.png)

---
> **标题**：[xargs 知多少？](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[xargs 知多少？](https://dengkaiting.com/)
> **时间**：2020-03-20
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。