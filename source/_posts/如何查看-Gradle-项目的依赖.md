---
title: 如何查看 Gradle 项目的依赖
toc: true
date: 2020-02-10 15:03:18
tags: Gradle
category:
thumbnail:
---

在 Gradle 项目中，有时候多个依赖包会造成冲突，那如何查看 Gradle 项目的依赖情况呢？
<!--more-->

使用命令 `gradlew MODULE_NAME: dependencies` 可以把该 MODULE_NAME 模块下的所有第三方类库以及其他模块的依赖情况打印出来，并且它能展示多中情况，比如 Compile 编译时，Runtime 时，Debug 时，以及 Release 时的各种情况。

它的展示还是分层展示，可以展示每个类库的名称以及版本号。

---
> **标题**：[如何查看 Gradle 项目的依赖](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2020-02-10
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。