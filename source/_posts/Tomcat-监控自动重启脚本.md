---
title: Tomcat 监控自动重启脚本
toc: true
date: 2019-03-20 10:05:17
tags:
category:
thumbnail:
---

记录一个 Tomcat 监控自动重启脚本
<!--more-->

```bash
#!/bin/sh
# monitor_tomcat.sh
# crontab 
# */5 * * * * bash /home/tryking/crontab/monitor_tomcat.sh >> /home/tryking/crontab/crontab.log 2>&1
# Please put tryking to /etc/cron.allow (allow user tryking enable crontab)

tomcat_pid=$(ps aux | grep catalina.home | grep -v grep | awk '{print $2}')
tomcat_start_script_file=/home/tryking/crontab/tomcat_start_script_file
monicot_log_file=/home/tryking/crontab/monitor.log
echo $tomcat_pid
Monitor() {
	echo "[info] start monitor Tomcat...[$(date +'%F %H:%M:%S')]"
	if [[ $tomcat_pid ]]; then
		echo "[info] tomcat is running, record the start script to $tomcat_start_script_file"
		ps aux | grep catalina.home | grep -v grep | awk '{for(i=1;i<=NF;i++)print $i}' | grep catalina.home | awk -F '=' '{print $2}'  | uniq | sed 's/$/\/bin\/startup.sh/g' | sed 's/^/bash /g' > $tomcat_start_script_file
	else
		echo "[info] tomcat is not running, start tomcat by $tomcat_start_script_file]"
		cat $tomcat_start_script_file | while read line 
		do
			#statements
			echo $line
	 		eval $line
		done
	fi
}

Monitor >> $monicot_log_file  

```

---
> **标题**：[Title](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-03-20
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。