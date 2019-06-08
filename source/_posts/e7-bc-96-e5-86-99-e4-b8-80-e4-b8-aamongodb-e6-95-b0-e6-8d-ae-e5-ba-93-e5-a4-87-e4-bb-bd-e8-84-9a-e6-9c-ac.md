---
title: 编写一个MongoDB数据库备份脚本
url: 139.html
id: 139
categories:
  - Shell
date: 2018-06-05 22:12:09
tags:
---

公司的开发环境多人共用一个MongoDB数据库，为了防止自己的数据被别人误删，可以写一个每天备份数据的定时任务来备份数据。

    #!/bin/sh
    DB_HOST="10.10.10.1:10001"
    
    DB_NAME="music"
    
    USER="music"
    PWD="haha@2018"
    SINGER_RECORD="pro_search_singer_record"
    
    
    OUT_DIR="/home/dkt/crond/back_up_data_temp" #临时备份目录
    
    TAR_DIR="/home/dkt/crond/back_up_data" #备份存放路径
    
    DATE=$(date +%Y_%m_%d) #获取当前系统时间
    
    echo "-----当前时间为$DATE-----"
    
    DAYS=7 #DAYS=7代表删除7天前的备份，即只保留最近7天的备份
    
    TAR_BAK="mongod_bak_$DATE.tar.gz" #最终保存的数据库备份文件名
    
    cd $OUT_DIR
    
    echo "-----删除原有备份文件-----"
    
    find $OUT_DIR/ -print
    
    rm -rf $OUT_DIR/*
    
    mkdir -p $OUT_DIR/$DATE
    
    echo "-----开始备份数据-----"
    
    #mongoexport可以使用绝对路径，以防止命令找不到
    mongoexport -h $DB_HOST -d $DB_NAME -u $USER -p $PWD -c $SINGER_RECORD -o $OUT_DIR/${DATE}/singer_record
    
    # -h: MongoDB所在服务器地址
    # -d: 需要恢复的数据库实例
    # -c: 需要恢复的集合
    # -f: 需要导出的字段(省略为所有字段)
    # -o: 表示导出的文件名
    
    mongodump -h $DB_HOST -o $OUT_DIR/$DATE #备份全部数据库，具体可以参照：  mongodump --help
    
    echo "-----开始压缩备份文件-----"
    
    tar -zcvf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE #压缩为.tar.gz格式
    
    echo "-----删除7天前的备份文件-----"
    
    find $TAR_DIR/ -mtime +$DAYS -delete #删除7天前的备份文件
    

问题
--

*   将脚本添加到定时任务crondtab中，可能会找不到 mongodump 命令，需要使用 mongodump 的全路径。
*   当密码中有特殊字符 @ 等时，会报 \[error connecting to db server: server returned error on SASL authentication step: Authentication failed.\] 此错误。这时需要使用 `-p '密@码'` 来代替，具体用变量名如何来代替还未找到解决方法。