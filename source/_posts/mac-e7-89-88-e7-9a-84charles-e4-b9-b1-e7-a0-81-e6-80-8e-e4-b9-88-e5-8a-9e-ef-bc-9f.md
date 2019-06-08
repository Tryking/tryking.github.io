---
title: Mac版的Charles乱码怎么办？
url: 92.html
id: 92
categories:
  - Tools
date: 2018-05-25 17:03:59
tags:
---

之前在Windows上用的抓包工具主要是Fiddler，由于之前对Fiddler用的也不是很熟，在Windows上也是各种不顺，遂查了下Mac下哪个软件不错，网上一致推荐Charles，那就下个Charles来一发吧。 装好之后，立马就来一发，让人崩溃的是 _-_ ![image](http://media.dengkaiting.com/Charles-01.jpg) 这是啥？怎么全是乱码？！网上找了一些解决办法，经过多次尝试，找到一个靠谱的，记录如下。

安装SSL证书
-------

![image](http://media.dengkaiting.com/Charles-02.jpg)

1.  如上图，点击按照证书，如果运气不好，会出现如下情形：

![image](http://media.dengkaiting.com/Charles-03.jpg)

2.  这时，可以选择保存CA文件到本地，然后自己在拖到‘系统钥匙串’中。此步需要输入密码。

![image](http://media.dengkaiting.com/Charles-04.jpg)

3.  放进去后，会发现有爆红。

![image](http://media.dengkaiting.com/Charles-05.jpg)

4.  证书不受信任，那我们就自己设置一下吧。双击刚拖入的证书，进入设置，设置如下所示，把对应位置设置为‘始终信任’，然后关闭即可。此步需要输入密码。

![image](http://media.dengkaiting.com/Charles-06.jpg)

5.  完成后可以看到已经不爆红了。

![image](http://media.dengkaiting.com/Charles-07.jpg)

设置 Charles 的 SSL选项
------------------

安装完证书后，还需要设置Charles的SSL选项，点击Proxy → SSL Proxying Settings，进入设置页面。在设置页面点击Add，设置如下： ![image](http://media.dengkaiting.com/Charles-08.jpg) 然后OK保存，此时重新刷新网页，可以看到我们的Charles已经正常工作了。 ![image](http://media.dengkaiting.com/Charles-09.jpg)

后记
--

Chrome浏览器默认走的不是系统本身的代理，而Charles代理的是系统本身。因此Chrome使用时需要配置代理或者直接使用SwitchyOmega等软件监听本地的8888端口（Charles默认为8888端口）。