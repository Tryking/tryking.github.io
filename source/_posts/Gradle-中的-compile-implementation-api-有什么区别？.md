---
title: 'Gradle 中的 compile, implementation, api 有什么区别？'
toc: true
date: 2019-09-01 18:07:40
tags:
category:
thumbnail:
---

在 Gradle 中，我们应用一个 library 的时候，一般会使用 `compile`, `implementation`, `api` 等这几种方式，你知道什么时候该用什么吗？
<!--more-->

# 区别

首先说明，`compile` 虽然存在，但是它已经不被 `Gradle` 推荐使用。Gradel 3.0 中已经声明`compile` 应该被 `api` 和 `implementation` 替换。下面说 `compile` 和 `api` 的区别。

比如，

```Groovy
dependencies {    api 'commons-httpclient:commons-httpclient:3.1'    implementation 'org.apache.commons:commons-lang3:3.5'}
```
使用 `api` 配置引用的依赖将会传递暴露给当前 library 的消费者，它会出现在消费者的编译类路径下。
使用 `implementation` 配置引用的依赖不会暴露给当前 library 的消费者，因此它不会出现在消费者的编译类路径下。

使用 `implementation` 的有以下几点好处：

* 依赖不会再泄露到消费者的编译类路径下，因此将不会意外地发生传递依赖的问题。
* 因为减少了类路径的大小，因此编译速度更快。
* 当 `implementation` 发生改变时，消费者将不需要进行重新编译，因此编译次数变少了。
* 更简洁地发布：当和 `maven-publish` 插件一起使用时，Java 库生成的 POM 文件可以准确地区分针对该库进行编译所需的内容和在运行时针对该库所需的内容。（换句话说，不混合编译库本身所需的内容以及对库进行编译所需的内容）

如果你只在自己的应用模块中使用三方的库，其实你使用两者没有任何差别。但是如果你有一个包含相互依赖的复杂项目，或者你正在创建库时，你才能体会到这种差异。
 
# 举例 
下面举个例子。

假如我们有个项目有三个模块（module），A，B，C。它们的依赖关系如下：

A -> B -> C，即 A 依赖于 B，B 依赖于 C。

在 C 中，有一个 CSecret 类，

```Java
public class CSecret {
	
	publis static String getSecret() {
		return "password";
	}
}
```

在 B 中有个方法需要使用 C 中的 CSecret 类，

```Java
public class BContent {
	private static String content = CSecret. getSecret();	public static String getContent() {    	return "My content: " + content;	}
}    
```

最后，在 A 中我们调用 B 中的 getContent 方法来获取我们需要的结果。

```Java
public class ATest {
	
	public static void main(String args) {
		BContent bContent = new BContent();
		System.out.println("Get bContent: " + bContent.getContent());
	}
}
```

现在，我们针对依赖来讨论一下。

A 需要消费 B，因此在 A 的 build.gradle 中需要使用 `implementation`。

```Groovy
dependencies {    implementation project(':B')      }
```

那么，在 B 的 build.gradle 中需要怎么写呢？

我们有以下三种方式可供选择：

```
dependencies {    // 方式 #1    implementation project(':C')     // 方式 #2    compile project(':C')          // 方式 #3    api project(':C')           }
```

如果你使用 `compile` 或者 `api`，那我们在 A 模块中就可以直接访问到 C 模块，即我们可以直接调用 C 中的 `CSecret`，显然这不是我们需要的。

假如我们使用 `implementation`，那么 C 模块将不会对 A 暴露，这才是我们需要的结果。

# 总结
这下你应该知道我们该如何选择了吧？

当我们需要给消费者暴露内部依赖的时候，使用 `api` 或者 `compile`。（`complie`已经不被推荐使用了，因此我们最好使用 `api`）

当我们不需要暴露给消费者我们内部依赖的时候，使用 `implementation`。其实，大多数情况下，我们应该使用的就是这个。


---
> **标题**：[Title](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-09-01
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。