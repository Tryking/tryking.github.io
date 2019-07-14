---
title: Gradle - 构建 Java 应用程序
toc: true
date: 2019-07-14 09:35:56
tags:
- Gradle
category:
- Gradle
thumbnail:
---
此教程会演示如何使用 Gradle 的 Build Init 插件创建遵循 Gradle 约定的新 Java 应用程序。

<!--more-->

## 你需要准备
* 大约 9 分钟的时间
* 一个文本编辑器
* 一个命令提示符
* JDK 8 或者更高版本
* 版本为 5.4.1 或者更高的 Gradle 分发版

## 查看用户手册
Gradle附带一个名为Build Init插件的内置插件。它在Gradle用户手册中有记录。该插件提供了一个名为init的任务，用于生成项目。该插件还使用（也是内置的）包装器任务来创建Gradle包装器脚本gradlew。

Gradle 默认有一个名为 `Build Init` 的内置插件，在 [Gradle 用户手册](https://docs.gradle.org/5.4.1/userguide/build_init_plugin.html) 中有记录。该插件提供了一个名为 `init` 的任务，用于生成项目。该插件还会使用 `wrapper`（也是内置的）任务来创建 Gradle 包装器脚本 `gradlew`。

## 步骤

第一步需要给新项目创建一个文件夹，然后进入该目录。

```shell
$ mkdir demo
$ cd demo
```

## 运行 init 任务

进入新项目的目录后，运行 `init` 任务，当提示的时候选择 `java-application` 项目类型。其他问题，直接按 `enter` 使用默认的值即可。

```shell
$ gradle init
Starting a Gradle Daemon (subsequent builds will be faster)

Select type of project to generate:
  1: basic
  2: cpp-application
  3: cpp-library
  4: groovy-application
  5: groovy-library
  6: java-application
  7: java-library
  8: kotlin-application
  9: kotlin-library
  10: scala-library
Enter selection (default: basic) [1..10] 6

Select build script DSL:
  1: groovy
  2: kotlin
Enter selection (default: groovy) [1..2] 

Select test framework:
  1: junit
  2: testng
  3: spock
Enter selection (default: junit) [1..3] 

Project name (default: demo): 
Source package (default: demo): 

BUILD SUCCESSFUL in 23s
2 actionable tasks: 2 executed
```

如果你喜欢使用 Kotlin 语言，你也可以选择 `kotlin` 构建脚本 DSL。

`init` 任务首先会运行 `wrapper` 任务，它将生成 `gradlew` 和 `gradlew.bat` 包装脚本。然后它会创建一个如下所示结构的新项目：

```
├── build.gradle
├── gradle 1️⃣
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties
├── gradlew
├── gradlew.bat
├── settings.gradle
└── src
    ├── main
    │   ├── java 2️⃣
    │   │   └── demo
    │   │       └── App.java
    │   └── resources
    └── test     3️⃣
        ├── java
        │   └── demo
        │       └── AppTest.java
        └── resources
```

> 1️⃣：生成的包含 wrapper 文件的文件夹
> 
> 2️⃣：默认的 Java source 文件夹
> 
> 3️⃣：默认的 Java test 文件夹


## 查看生成的项目文件

`settings.gradle` 文件中有很多注释行，但是只有一个活动行。

```shell settings.gradle
rootProject.name = 'demo'
```

这会将根项目的名称设置为 `demo`，如果不设置此值，默认会将目录名作为项目名。

生成的 `build.gradle` 文件也有许多注释。此处将活动行列出（注意依赖项的版本号可能会在更高版本的 Gradle 中有所更新）。

```shell build.gradle
plugins {
    id 'java'

    id 'application'
}

repositories {
    jcenter() 1️⃣
}

dependencies {
    implementation 'com.google.guava:guava:27.0.1-jre' 2️⃣

    testImplementation 'junit:junit:4.12'              3️⃣
}

mainClassName = 'demo.App'   4️⃣
```

> 1️⃣：公共 `Bintray Artifactory` 存储库.
> 
> 2️⃣：Google Guava library
> 
> 3️⃣：JUnit testing library
> 
> 4️⃣：含有 "main" 方法的类（使用 Application 插件）。

构建文件增加了 `java` 和 `application` 插件。`java` 插件用于支持 Java 程序，`application` 插件让你指定一个具有 main 方法的类，该方法可以通过命令行中的构建来执行。在这个示例中，主类的名称是 `App`。

文件 `src/main/java/demo/App.java` 的内容如下：

```java src/main/java/demo/App.java
package demo;

public class App {
    public String getGreeting() {
        return "Hello world.";
    }

    public static void main(String[] args) {  1️⃣
        System.out.println(new App().getGreeting());
    }
}
```
> 1️⃣：被 Application 插件的 `run` 任务调用。

文件 `src/test/java/demo/AppTest.java` 的内容如下：

```java src/test/java/demo/AppTest.java
package demo;

import org.junit.Test;
import static org.junit.Assert.*;

public class AppTest {
    @Test public void testAppHasAGreeting() {
        App classUnderTest = new App();
        assertNotNull("app should have a greeting", classUnderTest.getGreeting());
    }
}
```

生成的 test 类有一个用 JUnit 的 `@Test` 注释的测试。test 会实例化 App 类，调用 `getGreeting` 方法，然后检查返回的值是否为 `null`。

## 执行构建

想要构建项目，需要执行 `build` 任务。你可以使用常规的 gradle 命令，但是当一个项目包含一个 `wrapper` 脚本时，用它来代替执行是更好地选择。

```shell
$ ./gradlew build
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :jar
> Task :startScripts
> Task :distTar
> Task :distZip
> Task :assemble
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses
> Task :test
> Task :check
> Task :build

BUILD SUCCESSFUL
8 actionable tasks: 8 executed
```

> 当你第一次运行 `wrapper` 脚本 `gradlew` 时，可能需要花费一些时间等待该 gradle 版本下载并存储到你的 `~/.gradle/warpper/dists` 文件夹中。

当你第一次运行构建时，`Gradle` 将检查在你的 `~/.gradle` 目录中是否已经有 `Guava` 和 `JUnit` 库的缓存。如果没有，这些库将被下载并且存储在缓存目录下。下一次你运行这个构建的时候，缓存版本将被使用。此构建任务将会编译 classes，运行 tests，然后生成一个 test 报表。

你可以打开 HTML 输出文件查看 test 报表，报表在 `build/reports/tests/test/index.html` 文件中。

一个简单的报表如下：

![test report](https://guides.gradle.org/building-java-applications/images/Test-Summary.png)


## 运行程序

因为 Gradle 构建使用了 Application 插件，因此你可以在命令行中运行 `application`。首先，使用 `tasks` 任务查看有什么任务被添加进了插件。

```
$ ./gradlew tasks

> Task :tasks

------------------------------------------------------------
Tasks runnable from root project
------------------------------------------------------------

Application tasks
-----------------
run - Runs this project as a JVM application

// ... many other tasks ...
```

`run` task 会告诉 Gradle 让其执行被分配了 mainClassName 属性的类中的 main 方法。

```shell
./gradlew run

> Task :run
Hello world.

BUILD SUCCESSFUL in 0s
2 actionable tasks: 1 executed, 1 up-to-date
```

## 总结

现在你使用 Gradle 的 build init 插件生成了一个新的 Java 项目，在此过程中，你看到了：

* 如何生成一个 Java 应用。
* 如何生成构建文件以及了解 Java 文件的结构。
* 如何运行构建以及查看 test 报表。
* 如何使用 Application 插件的 `run` task 执行 Java 应用程序。

> 声明：本文为官方文档的翻译。[Building Java Applications](https://guides.gradle.org/building-java-applications/)


---
> **标题**：[Gradle - 构建 Java 应用程序](https://dengkaiting.com/2019/07/02/Gradle%20-%20构建%20Java%20应用程序)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[https://dengkaiting.com/2019/07/02/Gradle%20-%20构建%20Java%20应用程序](https://dengkaiting.com/2019/07/02/Gradle%20-%20构建%20Java%20应用程序)
> **时间**：2019-07-11
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。