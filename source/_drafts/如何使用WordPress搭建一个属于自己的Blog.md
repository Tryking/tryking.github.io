---
title: 如何使用WordPress搭建一个属于自己的Blog
url: 33.html
id: 33
tags:
---

> WordPress是依托于MySQL数据库，以及PHP后端服务器的，因此我们只需要在服务器上装上MySQL和PHP后端服务器即可。

*   首先，我们可以使用Docker的镜像库 richarvey/nginx-php-fpm 安装嵌入了nginx的PHP后端服务器。 `docker pull richarvey/nginx-php-fpm:latest`