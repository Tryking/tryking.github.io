---
title: 如何启动Jupyter
url: 81.html
id: 81
date: 2018-05-23 12:01:25
tags:
---

Jupyter可以用来调试程序，因为它自带了tab键可以预览函数功能，因此对有一些比较生疏的函数的使用非常有利。

1.  生成配置文件

     jupyter notebook --generate-config
    

此命令会默认在 ~/.jupyter/文件夹下创建一个 jupyter\_notebook\_config.py 配置文件

2.  生成密码

    from notebook.auth import passwd
    passwd()
    

进入Python命令行，导入passwd 模块，然后输入函数 passws() ，系统会让你确认两次密码来生成密码的加密值。此密码用于后面登录Jupyter。请将生成的密码加密值复制出来。

3.  修改配置文件

在第1步我们生成了默认的配置文件，这里需要对其做修改。打开 jupyter\_notebook\_config.py 文件，对下列值进行修改。

    c.NotebookApp.ip = ''
    c.NotebookApp.open_browser = False
    c.NotebookApp.port = 8899
    c.NotebookApp.password = 'sha1:dcf8c8c7907b:e478faebf003200468cd738010c09db2c9bf3bcd'
    

其中，ip为本服务器ip，open_browser设置为 False 的话启动Jupyter不会默认打开浏览器，port为想要启动Jupyter的端口号，passwd 就是你在第2步生成的密码加密字符串了。修改完成后保存即可。

4.  启动Jupyter

    jupyter notebook
    

输入命令即可启动Jupyter，这时访问你的ip+端口号即可进行访问。如果需要后台运行，可以使用 nohup jupyter notebook & 命令。