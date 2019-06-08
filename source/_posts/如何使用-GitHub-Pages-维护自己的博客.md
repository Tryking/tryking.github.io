---
title: 如何使用 GitHub Pages 维护自己的博客
date: 2019-06-08 23:08:18
tags:
---
# 前置知识

首先，你应该知道如何用 Hexo 在本地搭建一个博客系统，具体见 [Hexo](https://hexo.io/zh-cn/docs/)。

其次，我们如果想使用 GitHub Pages 搭建自己的博客只需要在 GitHub 创建一个名为`***.github.io`的 repository，其中`***`代表你 GitHub 的名字。然后将我们要展示的静态文件放到此 repository 的`master`分支下即可，具体见 [Websites for you and your projects.](https://pages.github.com/)。

搭建完毕之后，你需要了解 Hexo 发布博客的基本步骤，主要使用以下几个命令：

`hexo generate` 简写为 `hexo g`：此命令可以生成我们需要展示博客内容的静态文件。当我们写完自己的博客内容后，运行此命令可以把博客内容需要的静态文件放到目录 public 下。

`hexo server`：此命令可以在当前服务器（也就是你当前操作的电脑）启动博客服务，默认访问地址为：`http://localhost:4000/`。

到这里，我们就知道如何用 GitHub Pages 维护博客了，我们只需要把使用`hexo g`生成的静态文件放到我们创建的 `***.github.io` 的 master 分支下即可以用域名 `***.github.io` 来展示我们的博客内容了。

但是难道我们就只能这样手动去不断 copy 吗？当然不用，这里还需要知道的是 Hexo 支持自动将本地写的博客内容部署到服务器（如果使用 GitHub Pages，服务器指的就是自己的 Git repository），支持的类型有多种：Git, Heroku, Netlify, Rsync, SFTP 等，具体见 [Hexo 自动部署](https://hexo.io/zh-cn/docs/deployment)，我们只使用 Git 类型即可。

# 实际操作

我们写博客基本上不可能是只在一台机器上进行写作、部署，当我们使用不同的电脑时，如何进行便捷的同步操作呢？其实，我们完全可以使用我们创建的 `***.github.com` repository 来进行操作管理，我们最终展示的内容是放在 master 分支的，所以我们需要创建一个新的分支来保存我们写作的博客内容，即 Hexo 相关的东西。

在这里，我使用分支 hexo 来保存博客内容，当我们在 hexo 分支下把内容编辑完后，使用命令 `hexo deploy` 即可将生成的静态文件自动发布到 `***.github.com` repository 中的 master 分支中，稍等数秒，访问 `***.github.com` 即可以看到我们博客的更新了。

当我们使用别的机器更新博客时也是同样的操作，把 repository clone 到你想更新的机器上，使用 hexo 分支进行内容的编写，写完测试通过后直接 `hexo deploy` 即可。
































