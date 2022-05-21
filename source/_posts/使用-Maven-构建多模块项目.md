---
title: 使用 Maven 构建多模块项目
toc: true
tags:
  - Maven
category:
  - Java
date: 2021-05-21 14:51:05
thumbnail:
---

你知道如何使用 `Maven` 构建多模块的项目吗？
<!--more-->

# 什么是 Maven 的多模块项目
一个多模块项目由一个管理一组子模块的聚合 `POM` 构建而成。大部分情况下，这个聚合的 `POM` 位于项目的根目录中，它的类型必须是 `pom`。

子模块是常规的 `Maven` 项目，它们可以自己单独构建，也可以通过聚合的 `POM` 进行构建。通过聚合的 `POM` 构建的项目，每个拥有和 `pom` 打包类型不一致的子模块都会被构建生成一个归档包（jar, war 等）。

# 使用多模块的好处
使用多模块构建的最大好处是可以减少重复代码。

假如我们当前有一个包含多个模块的应用，一个前端模块和一个后端模块，现在我们需要对他们进行处理并更新功能。在这种情况下，如果没有专门的构建工具，我们将必须构建两个组件或者编写脚本来编译代码，运行测试并展示结果。往后，如果我们添加更多模块到此项目中后，它将会变得更加难以管理和维护。

在我们实际业务中，项目可能需要某些 Maven 插件在构建生命周期中执行各种操作，共享依赖项和 `profile`，以及包含其他 `BOM` 项目。

因此，利用多模块，我们可以用一条命令构建我们系统中的多个模块，我们我们的模块构建有顺序依赖，`Maven` 会自动为我们解决。我们还可以在不同模块之前共享大量的配置。

# 父 POM
`Maven` 支持继承：每个 `pom.xml` 文件都有隐式父 POM。这个隐式的父 POM 被称为`Super POM`，一般位于 Maven 的二进制文件中。Maven 会把当前 `pom.xml` 文件和 Super POM 合并形成一个有效的 POM。

我们可以创建自己的 `pom.xml` 作为我们的父项目。然后我们可以把所有的依赖配置放到里面，把它作为其它模块的父模块。

除了继承之外，`Maven` 还提供了聚合的概念。拥有此功能的`父 POM` 被称为`聚合 POM`。这种 `POM` 会在它的 `pom.xml` 文件中声明其它的子模块。

# 子模块
子模块，也可以说子项目，是从父 POM 继承的常规 Maven 项目。正如我们上面提到的，继承可以让子模块共享父模块的配置和依赖关系。但是如果我们想一次性构建并发布我们的项目，我们必须在父 POM 中明确声明我们的子模块。最终，对于子模块来说，我们的父 POM 就成为了它们的 父 POM，也可以说是`聚合POM`。

# 构建应用
现在我们了解了 Maven 的子模块和层次结构，接下来我们构建一个示例应用程序演示一下。我们使用 Maven 的命令行生成我们的项目。  这个应用程序包含三个模块：

* core: 应用的核心部分。
* service: 提供 REST API 的 web 服务。
* webapp: 一个 web app。

## 生成父 POM

首先，我们创建我们的父工程：

```shell
mvn archetype:generate -DgroupId=com.tryking -DartifactId=parent-project
```

父工程生成后，我们需要打开位于父工程目录下的 pom.xml 文件，增加打包方式为 `pom`。

```
<packaging>pom</packaging>
```

通过设置打包方式为 `pom`，我们声明该项目将作为将作为 `父 pom`或`聚合 pom`，它将不会产生额外的构建工作。

当我们的聚合器生成之后，我们就可以生成我们的子 module 了。

我们需要注意，聚合 pom 里面存放的是所有要共享的配置，这里面的配置会在子模块中重复使用。我们可以使用 `dependencyManagement` 或者 `pluginManagement`。

## 创建子模块

因为我们的父 POM 叫做 parent-project，我们需要确保我们在父目录中运行以下生成命令：

```shell
cd parent-project
mvn archetype:generate -DgroupId=com.tryking -DartifactId=core
mvn archetype:generate -DgroupId=com.tryking -DartifactId=service
mvn archetype:generate -DgroupId=com.tryking -DartifactId=webapp
```

生成子模块的命令和我们上面生成父模块是一样的。不同的是，这些子模块是常规的 Maven 项目，Maven 认识到他们和父模块是嵌套关系。当我们把目录切换到父目录时，它发现父模块有`pom`类型的打包类型，它会相应地修改 pom.xml 文件。

在父模块中的 pom.xml 文件中，Maven 会在 `modules` 部分增加所有的子模块。

```xml
<modules>  
  <module>core</module>
  <module>service</module>
  <module>webapp</module>
</modules>
```

在各个子模块的 pom.xml 文件中，Maven 会在 `parent` 部分增加父模块。

```xml
<parent>
  <artifactId>parent-project</artifactId>
  <groupId>com.tryking</groupId>
  <version>1.0-SNAPSHOT</version>
</parent>
```

接下来，Maven 会成功生成这三个子模块。注意子模块只能有一个父模块。但是，我们可以导入许多 `BOM`。

## 构建项目
现在，我们可以一次性构建三个子模块。在父模块目录下，我们运行 `mvn package`。

这会构建所有的子模块，我们可以看到如下输出：

```log
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Build Order:
[INFO] 
[INFO] parent-project                                                     [pom]
[INFO] core                                                               [jar]
[INFO] service                                                            [jar]
[INFO] webapp                                                             [jar]
[INFO] 
......
[INFO] Reactor Summary for parent-project 1.0-SNAPSHOT:
[INFO] 
[INFO] parent-project ..................................... SUCCESS [  0.002 s]
[INFO] core ............................................... SUCCESS [ 25.757 s]
[INFO] service ............................................ SUCCESS [  2.712 s]
[INFO] webapp ............................................. SUCCESS [  0.644 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  29.209 s
[INFO] Finished at: 2022-05-21T22:39:53+08:00
[INFO] ------------------------------------------------------------------------
```
Reactor 列出了父模块，但因为它的类型是 pom 类型，因此被排除了。其他三个模块被构建成了三个单独的 jar 包。另外，Maven Reactor 会分析我们的项目并以正确的顺序构建它。如果我们的 webapp 模块依赖 service 模块，Maven 将先构建 service 模块，然后构建 webapp 模块。

## 在父模块中启用 Dependency Management
`Dependency management` 是一种为多模块父项目及其子项目集中依赖信息的机制。

当我们有一组项目或模块继承了共同的父模块时，我们可以将相关依赖项的必要信息放在共同的父 pom.xml 文件中，这可以简化子 POM 对这些依赖的引用。

我们看个示例：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.3.20</version>
        </dependency>
        //...
    </dependencies>
</dependencyManagement>		
```

通过在父pom中声明 `spring-core` 的版本，所有依赖`spring-core`的子模块都可以只使用`groupId`和`articifId`来声明该依赖，它会自动继承父pom中依赖的版本。

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
    </dependency>
    //...
</dependencies>
```

此外，我们可以在父模块的 pom.xml 文件中为依赖管理提供排除项，这样子模块就不会继承特定的库了。
```xml
<exclusions>
    <exclusion>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
    </exclusion>
</exclusions>
```

最后，如果某个子模块需要使用不同版本的依赖管理项，我们可以在子模块的 pom.xml 中覆盖该版本。

```
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.11/version>
</dependency>
```

请注意，虽然子模块从其父项目继承，但是父项目可以不聚合任何模块。另一方面，父项目也可以聚合不继承自它的项目。

# 结论
本文我们讨论了使用 Maven构建多模块的好处。我们对多模块中常规Maven项目的父POM和

---
> **标题**：[使用 Maven 构建多模块项目](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[使用 Maven 构建多模块项目](https://dengkaiting.com/)
> **时间**：2021-05-21
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。