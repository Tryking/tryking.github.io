---
title: 听说你的腾讯云/阿里云主机访问不了 Github？
toc: true
tags:
  - 墙
category:
  - null
date: 2021-03-19 00:19:20
thumbnail:
---

怎么解决访问 Github 问题？

<!--more-->
因为博客部署在腾讯云主机上，某次上服务器更新博客时，发现出现如下提示：
`fatal: unable to access 'https://github.com/Tryking/tryking.github.io.git/': Encountered end of file`

诺？网络又被墙了，因为这台主机平时只做博客服务器，因此也懒得放科学工具了，那么有什么好的办法可以解决这个问题吗？

因为 Github 在全球都有服务器，我们是不是可以找一个腾讯云可以访问的地址替换掉自动解析的地址呢？

说干就干，首先访问一个ip查询工具，这里使用 `https://github.com.ipaddress.com/`，然后分别查询 `github.com` 和 `github.global.ssl.fastly.net` 对应的 IP。

编辑主机的 hosts 文件，`vim /etc/hosts`，将查到的结果添加进去。

```
140.82.112.3 github.com
199.232.69.194 github.global.ssl.fastly.net
```
再进行 `git pull`，嗯，代码成功拉下来了，这个方法临时用下还不错。

---
> **标题**：[听说你的腾讯云/阿里云主机访问不了 Github？](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[听说你的腾讯云/阿里云主机访问不了 Github？](https://dengkaiting.com/)
> **时间**：2021-03-19
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。