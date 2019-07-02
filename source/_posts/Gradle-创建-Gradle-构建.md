---
title: Gradle - 创建 Gradle 构建
date: 2019-07-02 23:35:25
tags:
	- Gradle
---

根据此教程，你可以创建一个小型 `Gradle` 项目，这里面会涉及一些基础的 `Gradle` 命令，你可以对 `Gradle` 是如何管理项目的有个深刻的理解。

## 你需要准备
* 大约 11 分钟的时间
* 一个终端工具（Terminal）
* 一个 Java 运行时环境（JRE）或者 Java 开发工具（JDK），Java 版本需要在 1.8 以上。
* 一个 [Gradle 发布版本](Gradle distribution)，版本最好在 4.10.3 及以上。

## 初始化一个项目

```Shell
> mkdir basic-demo
> cd basic-demo
```

现在就可以使用 Gradle 的 `init` 命令生成一个简单的项目了。我们将探索生成的所有东西，以便于你能知道发生了什么。

```Shell
> gradle init
Starting a Gradle Daemon (subsequent builds will be faster)

BUILD SUCCESSFUL in 3s
2 actionable tasks: 2 executed
```
运行完这个命令后应该会显示“BUILD SUCCESSFUL”，并且会生成以下 “空” 项目。如果没有执行成功，请检查一下 Gradle 是否正确安装了，并且你要确保你配置了正确的 `JAVA_HOME`环境。

Gradle 生成了如下内容：

Groovy

```
├── build.gradle  
├── gradle
│   └── wrapper
│       ├── gradle-wrapper.jar  
│       └── gradle-wrapper.properties  
├── gradlew  
├── gradlew.bat  
└── settings.gradle  
```

* `build.gradle` 用于配置当前项目的 Gradle 构建脚本。
* `gradle-wrapper.jar` 是 Gradle Wrapper 的可执行 JAR。
* `gradle-wrapper.properties` 是 Gradle Wrapper 的配置内容。
* `gradlew`是类 Unix 系统的 Gradle Wrapper 脚本。
* `gradlew.bat`是 Windows 的Gradle Wrapper 脚本。
* `settings.gradle` 是 Gradle 用于配置 Gradle 构建的设置脚本。

好啦！就这样，我们完成了基本的指导，但是你可能还想知道如何在项目中使用 Gradle。我们继续。

## 创建一个任务
Gradle 使用基于 Groovy 或者 Kotlin 的语言，给我们提供了一系列的 API，用于创建和配置任务。一个 `Project` 包含一系列的`Task`s，每个 task 都会执行一些基本的操作。 

Gradle 附带了一个可以在您自己的项目中配置的任务库。例如，有一个核心的 type 叫做 `Copy`，它会从一个地方复制文件到另一个地方。
`Copy` task 非常有用（可以参考 [see the documentation](https://docs.gradle.org/4.10.3/dsl/org.gradle.api.tasks.Copy.html) 获取详情），但是在这里，我们简化一下，执行以下步骤：

1. 创建一个文件夹 `src`。
2. 在 `src` 文件夹下增加一个文件 `myfile.txt` 。文件内容你可以随便写（也可以是空的），但是为了方便我们增加一行 `Hello, World!` 在里面。
3. 在 build 文件中定义一个 `Copy` (注意大小写)类型的任务`copy`，复制 `src` 文件夹到一个新的文件夹 `dest` 中。（我们不需要手动创建 `dest` 文件夹，task 会自动帮我们创建。）

build.gradle

```Groovy
task copy(type: Copy, group: "Custom", description: "Copies sources to the dest directory"){
	from "src"
	into "dest"
}
```
其中，`group` 和 `description`你可以随便写。你也可以省略，但是省略后在后面的`repost` task 中这些内容也会省略。

现在执行一下 `copy` task。

```Shell
❯ ./gradlew copy
> Task :copy

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
```

检查一下，在 dest 目录中生成了一个新的`myfile.txt`文件，它的内容和我们在 src 目录中的文件的内容是一样的。

## 应用插件 plugin
Gradle 提供了一系列的插件，有许多插件在 [the Gradle plugin portal](https://plugins.gradle.org/) 中可以找到。该发行版附带的其中一个插件是 `base` 插件。结合名为 `Zip` 的一个核心 type，你可以使创建一个 zip 压缩档，并且可以指定名字和位置。

使用`plugins`语法增加 `base` 插件到你的 build 脚本文件中。请确保在文件的最上面增加`plugins{}`块。

build.gradle

```Groovy
plugins {
    id "base"
}

... rest of the build file ...
```

然后可以增加一个任务对 src 目录创建一个 zip 压缩档。

build.gradle

```Groovy
task zip(type: Zip, group: "Archive", description: "Archives sources in a zip file"){
	from "src"
	setArchiveName "basic-demo-1.0.zip"
}
```
`base` 插件和 settings 一起工作可以在 `build/distributions` 文件夹下创建一个名为 “basic-demo-1.0.zip” 的压缩文件。

然后，运行新的 `zip` task，可以看到我们期望的 zip 压缩文件已经生成了。

```Shell
❯ ./gradlew zip
> Task :zip

BUILD SUCCESSFUL in 0s
1 actionable task: 1 executed
```

## 继续探索并调试你的 build

我们还能使用 Gradle 在我们的新项目中做什么呢？这儿有一份完整的列表可以查看: [reference to the command-line interface](https://docs.gradle.org/4.10.3/userguide/command_line_interface.html)。

### 发现可用的 `tasks`

`tasks` 命令会列出你可以调用的 Gradle tasks，其中包含 `base` 插件中的，和你自己增加定制的。

```Shell
❯ ./gradlew tasks
```

### 分析调试你的 build
Gradle 还提供了一个基于 Web 的丰富的构建视图，称为构建扫描（`build scan`）。

使用 `--scan` 参数或者在项目中显式应用 scan  插件，就可以免费在 [scans.gradle.com](https://scans.gradle.com/?_ga=2.184403814.1364564354.1562081056-635978884.1561560658) 上创建构建扫描。将构建扫描发布到 scans.gradle.com 上会将此数据传输到 Gradle 服务器。想要将你的数据放在你自己的服务器上，请查看 [Gradle Enterprise](https://gradle.com/enterprise?_ga=2.154642296.1364564354.1562081056-635978884.1561560658)。

当执行 task 的时候可以尝试使用 `--scan` 参数创建一个 build scan。

```Shell
❯ ./gradlew zip --scan

BUILD SUCCESSFUL in 0s
1 actionable task: 1 up-to-date

Publishing a build scan to scans.gradle.com requires accepting the Terms of Service defined at https://scans.gradle.com/terms-of-service. Do you accept these terms? [yes, no]
Gradle Cloud Services license agreement accepted.

Publishing build scan...
https://gradle.com/s/repnge6srr5qs
```

### 发现可用的配置

`properties` 命令会展示关于你的项目的属性。

```Shell
❯ ./gradlew properties
```
输出会比较多，这里我们列出一小部分可用的配置。

```
> Task :properties

------------------------------------------------------------
Root project
------------------------------------------------------------

buildDir: /Users/.../basic-demo/build
buildFile: /Users/.../basic-demo/build.gradle
description: null
group:
name: basic-demo
projectDir: /Users/.../basic-demo
version: unspecified

BUILD SUCCESSFUL
```
项目的 `name` 默认适合目录名相同的。你也可以指定 `group` 和 `version` 属性，但是现在我们使用的是它们的默认值。

`buildFile` 属性是 build 脚本的全路径，它默认使用的是项目目录。

我们可以改变许多属性。例如，我们可以增加以下内容到 build 脚本文件中，重新执行 `gradle properties`。

```
description = "A trivial Gradle build"
version = "1.0"
```

## 下一步
恭喜！我们已经创建了一个新的 Gradle build，并且学习了如何检查 Gradle build。

如果碰巧你也想要在特定的平台上创建一个 library 或者 application，你可以参照下面的指导。

* Building Android Apps

* [Building Java Libraries](https://guides.gradle.org/building-java-libraries)

* Building Kotlin JVM Libraries

* Building C++ Executables

* Building Groovy Libraries

* Building Scala Libraries

你还可以在 [sample Gradle builds on GitHub](https://github.com/gradle/gradle/tree/master/subprojects/docs/src/samples) 查看更多构建示例。

> 声明：本文为官方文档的翻译。[Creating New Gradle Builds](https://guides.gradle.org/creating-new-gradle-builds/#explore_and_debug_your_build)