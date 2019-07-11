---
title: 玩转 Spring - 利用 Gradle 使用 Spring
toc: true
date: 2019-07-11 21:10:16
tags:
category:
thumbnail:
---
本节我们介绍下如何使用 `Gradle` 来搞定 `Spring` 依赖。

<!--more-->
## 基本的 Spring 依赖
Spring 设计的非常巧妙，它的各个模块都是独立的，我们在使用其中一个模块的时候基本不需要依赖其他的模块。例如，基础的 Spring Context 不需要和 Spring 的 Persistence 持久化库 以及 MVC 库一起使用。

如果我们想使用最基本的 Spring - Context，只需要加入以下依赖：

```Groovy
dependencies {
    compile 'org.springframework:spring-context:5.1.8.RELEASE'
}
```

`spring-context` 依赖定义了真正的 Spring 注入容器，它包含了一丢丢依赖项：`spring-core`, `spring-expression`, `spring-aop` 以及 `spring-beans`。这些依赖支持一些核心的 Spring 技术，以此增强了 Spring 容器的能力。这些核心技术包括：核心的 Spring 程序，Spring 表达式语言（SpELl），支持面向切面编程以及 JavaBeans 技术。

实际上，我们是在运行时范围中定义了依赖关系 - 这可以确保我们对于任何特定的 Spring API 没有编译时依赖性。对于一些更高级的用例，我们可以从一些特定的 Spring 依赖项中删除运行时范围，但是对于一般的项目来说，我们不需要这么做，这样可以充分利用 Spring 的便捷性。

从 Spring 3.2 版本开始，我们便不需要定义 CGLIB （一个强大的工具，可以在运行时依赖反射等扩展 Java 类与实现 Java 接口）依赖了。它已经被直接集成到 spring-core Jar 包中了。

## 使用 Spring Persistence 持久化

对于 Spring Persistence 持久化，主要是使用 spring-orm 依赖。

```Groovy
dependencies {
    compile 'org.springframework:spring-orm:5.1.8.RELEASE'
}
```
这个依赖包括 Hibernate 和 JPA，例如 HibernateTemplate 和JpaTemplate，还有一些额外的与持久性相关的依赖项：spring-jdbc 和 spring-tx 。

JDBC 数据访问依赖定义了对 Spring JDBC 的支持以及  JdbcTemplate，spring-tx 则提供了非常灵活的事务管理。

## 使用 Spring MVC

想要获得 Spring Web 和 Servlet 的支持，除了上面的核心依赖以外，还需要在 build.gradle 中加入两个依赖：

```Groovy
dependencies {
    ...
    compile 'org.springframework:spring-web:5.1.8.RELEASE'
    compile 'org.springframework:spring-webmvc:5.1.8.RELEASE'
}
```

spring-web 依赖中包含对于 Servlet 和 Portlet 环境中通用的 web 工具支持，spring-webmvc 使得在 Servlet 环境中能够使用 MVC。

由于spring-webmvc将spring-web作为依赖项，因此在使用spring-webmvc时不需要明确定义spring-web。

因为 spring-webmvc 将 spring-web 作为依赖项，因此如果引用了 spring-webmvc 就不需要明确定义 spring-web 依赖了。

## 使用 Spring Security

对于 Spring Security 的依赖，我们后面专门用一篇文章来讨论下。

## 使用 Spring Test

Spring Test 框架可以使用以下的依赖项导入：

```Groovy
dependencies {
  	...
    compile 'org.springframework:spring-test:5.1.8.RELEASE'
    ...
}
```
从Spring 3.2开始，Spring MVC Test项目作为github上的独立项目开始，已经包含在核心测试框架中 - 因此包含弹簧测试依赖性就足够了。

在最早以前 Spring MVC Test 项目是作为一个独立的项目在 GitHub 上发布的，但是从 Spring 3.2 开始，它已经放入核心的 Test 框架中了，因此如果我们要使用 Spring MVC Test，只要引入 spring-test 就足够了。

如果你还在使用 Spring 3.1 以及更低版本的 Spring，之前那些旧的依赖仍然可以使用，并且它们和现在的新框架相差不大。但是，这些依赖已经不在 Maven Central 上维护了，使用时可能需要添加自定义的存储库。

## 使用 Spring Milestones 版本

Spring 的版本发布是托管在 Maven Central 上的，如果我们的项目需要使用 Spring 的里程碑版本，则需要将自定义的 Spring 存储库添加到依赖项中。

```Groovy
repositories {
    maven {
        url = 'http://repo.spring.io/milestone'
    }
}
```

定义存储库后，我们的项目就可以使用 Spring 的里程碑版本了：

```Groovy
dependencies {
    compile 'org.springframework:spring-context:3.2.0.RC2'
```

## 使用 Spring Snapshot 版本

和 Milesones 一样，Snapshot 版本也定义在一个仓库中：

```Groovy
repositories {
    maven {
        url = 'http://repo.spring.io/snapshot'
    }
}
```
定义存储库后，我们的项目就可以使用 Spring 的 Snapshot 版本了：

```Groovy
dependencies {
    compile 'org.springframework:spring-context:4.0.3.BUILD-SNAPSHOT'
```

## 结语

本篇文章我们讨论了利用 Gradle 使用 Spring 的一些细节。当然，我们只介绍了一些重要的依赖项，Spring 还有很多其他的依赖项值的我们使用学习，后面我们将一起来学习 Spring 依赖库的使用。

---
> **标题**：[玩转 Spring - 利用 Gradle 使用 Spring](dengkaiting.com/2019/07/11/玩转-Spring-使用-Gradle-操作-Spring/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[https://dengkaiting.com/2019/07/11/玩转-Spring-使用-Gradle-操作-Spring/](https://dengkaiting.com/2019/07/11/玩转%20Spring%20-%20利用%20Gradle%20使用%20Spring/)
> **时间**：2019-07-11
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。