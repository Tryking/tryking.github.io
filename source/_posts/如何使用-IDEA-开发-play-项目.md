---
title: 如何使用 IDEA 开发 Play 项目
toc: true
date: 2020-02-12 21:54:43
tags:
category:
thumbnail:
---
Play 是一个非常优秀的 web 开发工具，你知道如何使用 IDEA 进行开发吗？

<!--more-->

在 `IDEA` 中开发 `Play` 项目时，默认是不会自动导入 `Play` 的依赖的，我们需要把 `Play` 的依赖导入，主要包括 `Play` 的 jar 包以及它的 libs。

打开 `Project Settings`，可以看到我们的依赖中没有 `Play` 相关的内容， 我们需要导入。

![mark](http://media.dengkaiting.com/play/20200212/qmXtHEKh8DjA.png)

我们点击上图中右边的 `+` 号，选择 `JARs or directories`，然后找到我们的 `Play` 所在目录，分别将 `lib` 和 `play.jar` 导入。

![mark](http://media.dengkaiting.com/play/20200212/gGP5jAqC97Bp.jpg)

接着，我们打开 `Run/Debug Configurations`，配置一个 Play 的启动命令。

![mark](http://media.dengkaiting.com/play/20200212/hdb7iUMAYEom.jpg)

我们在 Main class 中输入 play 的启动路径 `play.server.Server`。

![mark](http://media.dengkaiting.com/play/20200212/zpNmkd1IzlNd.jpg)

好了，愉快地享受 Play 吧。


---
> **标题**：[Title](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：{{ date }}
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。