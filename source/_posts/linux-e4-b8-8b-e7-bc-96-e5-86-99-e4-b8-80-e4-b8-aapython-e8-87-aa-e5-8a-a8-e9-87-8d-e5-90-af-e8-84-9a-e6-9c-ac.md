---
title: Linux下编写一个Python自动重启脚本
url: 113.html
id: 113
categories:
  - Shell
date: 2018-05-26 14:02:11
tags:
---

团队中有一大部分的监控任务都是自己来做的，这其中包括了很多脚本，主要是Python脚本。但是有时由于不可预料的原因，Python会异常终止，因此编写一个自动检测Python脚本是否异常终止的脚本，当异常终止时，重新启动即可。
<!--more-->

    #!/bin/sh
    
    # 一定要保证路径下Python文件唯一
    base_path='/home/report724'
    pythons_3=("ElkMaster.py" "CopyAndCrawlerDayData.py" "RabbitMQStatus.py")
    pythons_2=("CoreMonitor.py" "SparkMonitor.py" "AthenaErrorLog.py" "ServiceIpCount.py" "AthenaForOperations.py")
    
    function start_python_3(){
            # $1 为程序的名字，即 *.py
            program=$1
            echo $program
            pro_path=$(find $base_path -name $program)
            echo $pro_path
            cd ${pro_path%/*}
            nohup ppython3 $pro_path > /dev/null &
            curl "http://172.30.111.111:8088/report/monitor/sendSmsCode?phoneNumber=15788888888&captcha=999999&message=${program}已重启"
    }
    
    function start_python_2(){
            # $1 为程序的名字，即 *.py
            program=$1
            echo $program
            pro_path=$(find $base_path -name $program)
            echo $pro_path
            cd ${pro_path%/*}
            nohup python $pro_path > /dev/null &
            curl "http://172.30.111.111:8088/report/monitor/sendSmsCode?phoneNumber=15788888888&captcha=999999&message=${program}已重启"
    }
    
    # index=0
    echo `date "+%Y-%m-%d %H:%M:%S"`
    for python in ${pythons_3[@]}; do
            #statements
            ps aux | grep $python | grep -v grep
    
            if [[ $? -ne 0 ]]; then
                    #statements
                    echo "start process....."
                    start_python_3 $python
            else
                    echo "running....."
            fi
            # echo $index
            # index=`expr $index + 1`
    done
    
    for python in ${pythons_2[@]}; do
            #statements
            ps aux | grep $python | grep -v grep
    
            if [[ $? -ne 0 ]]; then
                    #statements
                    echo "start process....."
                    start_python_2 $python
            else
                    echo "running....."
            fi
            # echo $index
            # index=`expr $index + 1`
    done
    

因为有很多脚本，有些是用Python2运行的，有些是用Python3运行的，因此对Python2和Python3（我设置的本机Pythone3命令为ppython3）分别写了函数。 函数中还用一个curl访问了一个短信通知接口，当程序重启后会进行短信通知。 把此脚本添加到 crontab 任务中，每5分钟运行检测一次即可。

待完善
---

1.  对程序是否启动成功没有加以判断，默认是启动成功的。
2.  必须保证在 base_path 路径下要监控的Python脚本文件是唯一的，否则无法正确找出其所在路径。

注意
--

此脚本需要用命令source 脚本.sh 来执行，否则 `cd ${pro_path%/*}` 不会执行成功。