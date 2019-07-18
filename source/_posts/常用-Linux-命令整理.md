---
title: 常用 Linux 命令整理 - 账户相关
toc: true
date: 2019-07-09 21:19:41
tags:
category:
thumbnail:
---
`Linux` 是我们在开发工作中必不可少的技能了，部署、维护应用都需要懂一些 `Linux` 命令，现将自己常用的 `Linux` 命令整理一下，不定期补充更新，以供用时方便查找。

<!--more-->

## 账户相关

* 查看当前机器的账户

	```Linux
	head -n 4 /etc/passwd
	
	cat /etc/passwd
	```
	> /etc/passwd 中存储了用户信息
	
	显示如下：
	
	```
	root:x:0:0:root:/root:/bin/bash
	```
	* root: 账号名称
	* x: 密码（早期用户密码存放在此字段，现在存放在 `/etc/shadow` 中）
	* 0: UID, 0 为系统管理员（不一定只有 root 有）
	* 0: GID
	* root: 用户信息说明栏
	* /root: 家目录（默认用户家目录在 `/home/yourIDname`）
	* /bin/bash: Shell

* 增加用户

	```
	useradd USER_NAME
	```

	同时指定目录
	
	```
	useradd -d /data/USER_NAME -m USER_NAME
	```
	
* 设定密码

	```
	passwd USER_NAME
	```

* 删除用户

	```
	userdel USER_NAME
	```
	
* 显示用户信息

	```
	id USER_NAME
	```
	
* 增加 GROUP 组

	```
	groupadd GROUP
	```

* 增加用户 USER_NAME 同时将 USER_NAME 添加到组 GROUP

	```
	useradd -g GROUP USER_NAME
	```
	
* 修改组名

	```
	groupmod -n GROUP GROUP_1
	```
* 修改用户名

	```
	usermod -l USER_NAME USER_NAME_1
	```
	
* 查看当前用户所属组

	```
	groups
	```

* 让用户 USER_NAME 隶属于多个组

	```
	usermod -g GROUP_1[,GROUP_2,...] USER_NAME
	
	usermod -G GROUP_1[,GROUP_2,...] USER_NAME
	```

	
> g 是覆盖，G是添加。


* 检查非 root 用户账号是否过期（包括密码）

	```
	chage -l USER_NAME
	```
	
* 修改用户的密码有效期

	```
	chage -M 365 USER_NAME
	```

	> 修改 USER_NAME 的密码有效期为 365 天
	
* 一键创建用户名并设置组以及密码

	```
	groupadd mg --gid 1028
	useradd -u 1028 -G wheel -g mg mg
	echo 'qazxsw' | passwd --stdin mg
	```

























