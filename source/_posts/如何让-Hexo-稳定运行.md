---
title: 如何让 Hexo 在服务器稳定运行
date: 2019-06-09 13:17:01
tags: Hexo blog
---
# 背景
博客系统终于又搭建起来了（好一个又😶），但是每隔一段时间去访问自己的网站总是访问不到，去服务器查询 `ps aux | grep hexo`，发现 Hexo 进程已经挂掉了，想着自己用命令 `nohup hexo s -p 8080 > server.log` 启动应该没问题啊，无奈也找不到停止的相关日志，所以另寻出路：找一个能实现守护进程监控服务的东西，如果服务挂掉了就自动重启。

<!--more-->

首先想到的就是写一个 `shell` 脚本去进行，每隔固定时间去查询 Hexo 进程是否已经启动，没有的话重新启动。但是在实现之前我先去网上搜了一把，发现了一个神器：`PM2`。

`PM2` 是 node 的进程管理工具，利用它可以简化很多`node`应用管理的繁琐任务，像性能监控、自动重启等它都能实现，巧的是， Hexo 便是一个 node 应用，因此在这里我采用 `PM2` 来进行博客服务的自动重启功能。

# 步骤

* 首先，安装 `MP2`
 
	```
	npm install pm2 -g
	```
* 然后在我们启动服务的目录下新建一个 `js` 脚本文件：`hexo-auto.js`，内容如下：

	```
	var exec = require('child_process').exec;
	var cmd = 'nohup hexo s -p 8080 >> server.log &';
	
	exec(cmd, function(error, stdout, stderr) {
	  process.exit(0);
	});
	```
* 最后，执行命令：`pm2 start hexo-auto.js`，当页面出现以下内容时，表示我们成功了。

	![pm2](http://media.dengkaiting.com/PM2.png)
	
	图中所示表示的是我们在后台 fork 了一个子进程来运行 Hexo 服务，当 Hexo 进程退出时，子进程也随之退出。PM2 监控到之后会自动重启该进程。
	
# 常用的 PM2 命令
* 查看进程状态

	```
	pm2 list
	```
* 停止应用

	```
	pm2 stop id|name|all|json|stdin
	```
	> 其中，all 会将所有应用终止；id 为 `pm2 list` 查询出来的 id，name 为 `pm2 list` 查询出来的 name。其余两个暂时还不清楚。
	
* 重启应用

	```
	pm2 restart id|name|all|json|stdin
	```
	> 参数含义同 `pm2 stop`
	
* 删除应用

	```
	pm2 delete name|id|script|all|json|stdin
	```
	> 参数含义同 `pm2 stop`

* 查看某个应用的信息 

	```
	pm2 describe name|id
	```
	> 参数含义同 `pm2 stop`

# 后续问题
今天，运行 `pm2` 时出现如下报错：

```Shell
......
......
npm ERR! peer dep missing: eslint@>= 4.12.1, required by babel-eslint@10.0.1

npm ERR! peer dep missing: acorn@^6.0.0, required by acorn-jsx@5.0.1
```

看错误原因是缺少 `eslint` 依赖，执行以下命令安装即可：

``` Shell
npm install eslint@>=4.12.1
npm install acorn@^6.0.0
```
























