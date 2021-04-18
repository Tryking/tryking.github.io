---
title: 为啥我的 Gradle 一直 build 不成功？
toc: true
tags:
  - Gradle
category:

date: 2020-05-30 23:03:30
thumbnail:
---

为啥我的 Gradle 一直 build 不成功呢？这都得从当年折腾的翻墙说起。
<!--more-->

最近在自己电脑上 Build 项目一直编译不过去，刚开始以为是 Maven 仓库配置的不对，特意去[阿里云的代理库](https://help.aliyun.com/document_detail/102512.html?spm=a2c40.aliyun_maven_repo.0.0.361865e9CSUvC7)网站比对了自己的配置，发现是没有问题的。但是就是 Build 过不去，查看日志只是说是找不到相应的 library，很是郁闷。

静下心来仔细又去排查报错日志的时候，发现了这样一条日志。

```Log
Connect to 127.0.0.1:1087 [/127.0.0.1] failed: Connection refused (Connection refused)<eol>Caused by: java.net.ConnectException: Connection refused (Connection refused)</i>
```

What? 1087 端口连不上，我 build 项目，你连接 1087 端口干撒？待我苦苦冥想后，想起来自己之前使用 Shadowsocks 貌似使用的是这个端口，后来因为 Shadowsocks 不好用，就购买了第三方的服务。这个可能是当时自己因为网络不好用，配置了代理，后来换了代理后就忘记修改了，代理在哪里配置的呢？当然是 Gradle 的全局配置文件里，于是，打开 `~/.gradle/gradle.properties` 文件，发现了罪魁祸首。

```gradle.properties
systemProp.https.proxyPort=1087
systemProp.http.proxyHost=127.0.0.1
systemProp.https.proxyHost=127.0.0.1
systemProp.http.proxyPort=1087
```

把这几行配置注释掉，重新 build 项目。嗯，阿里云代理库的速度还是可以的。

---
> **标题**：[为啥我的 Gradle 一直 build 不成功？](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2020-05-30
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。