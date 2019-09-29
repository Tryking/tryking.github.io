---
title: 使用 ELK 监控 Tomcat Access Log
toc: true
date: 2019-09-17 21:47:11
tags:
category:
thumbnail:
---

为什么要监控 Tomcat Access Log 呢？因为这里面保存了太多有用的信息了。
<!--more-->

## 为什么要监控 Tomcat Access Log？

Tomcat Access Log 的展示信息在 `conf/server.xml` 中进行配置，默认配置如下：

```conf server.xml
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
```
其中， 各个占位符的含义如下：

|占位符	|	含义|
|	---	|	---	|
|	%h	|远程主机名|
|	%l	|远程逻辑 identd 用户名（总是返回 - ）|
|	%u	|远程用户身份验证|
|	%t	|请求的日期和时间|
|	%r	|请求的第一行，包括请求的方式，URL 以及 HTTP协议|
|	%s	|响应的 HTTP 状态代码|
|	%b	|发送的字节数，不包括 HTTP 头|

除了这些默认的展位符外，比较常用的还有 

|占位符	|	含义|
|	---	|	---	|
|	%D	|处理请求的时间（以毫秒为单位）|

同时，我们在代码中写到 HTTP 头的信息同样也能在这里获取到，比如我们在 HTTP Header 中放入了一个 header-key，我们便可以在 server.xml 中使用 %{header-key} 进行获取，然后打印日志到 access log 中。

可以看到，Access Log 中存放了很多有用的信息，如果我们能将这些信息利用起来，无疑对我们的业务排查是非常高效的。比如我们可以统计我们的请求的处理时间，响应成功率，发送 response 的大小等等。

## 如何进行监控
其实直接使用 ELK 便可以进行监控，使用 `Logstash` 把对应的日志处理，然后放到 `ElasticSearch` 中，最后再用 `Kibana` 进行展示。但是对于生产环境来说， `Logstash` 还是比较耗性能的。比较理想的做法是使用 `Filebeat`。

`Filebeat` 属于 `Beats` 家族，`Beats` 是单用途数据托运平台。它们以轻量级代理的形式存在于服务器上，并将来自成百上千台机器的数据发送到 `Logstash` 或 `Elasticsearch`。`Filebeat` 也可以对数据进行处理，然后直接存入 ES，但是考虑到对机器性能的影响，我更喜欢它将原始数据直接发送到 `Logstash`（和 Filebeat 不在相同机器），然后用 `Logstash` 将数据处理并放入 `ES` 中。

因此，监控的流程为 `Filebeat` 收集数据，将数据发送到 `Logstash`，然后 `Logstash` 对数据进行处理，并将处理后的数据发送到 `ES`，最后再用 `Kibana` 进行数据展示。

## 安装并配置 Filebeat
### 下载并安装 Filebeat

```shell script
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.2.1-x86_64.rpm
sudo rpm -vi filebeat-7.2.1-x86_64.rpm
```

### 编辑配置文件

修改 `/etc/filebeat/filebeat.yml`，设置 Tomcat Access Log 位置以及 `Logstash` 的连接信息（需要和下一步中安装的 ELK 中的信息保持一致）。

```smartyconfig
#=========================== Filebeat inputs =============================
filebeat.inputs:
 
# Each - is an input. Most options can be set at the input level, so
# you can use different inputs for various configurations.
# Below are the input specific configurations.
 
- type: log
 
  # Change to true to enable this input configuration.
  enabled: true
 
  # Paths that should be crawled and fetched. Glob based paths.
  paths:
    # The Tomcat Access Log path
    - /usr/local/apache-tomcat-8.5.41/logs/localhost_access_log*
 
...
#----------------------------- Logstash output --------------------------------
output.logstash:
  # The Logstash hosts
  hosts: ["localhost:5044"]
```

### 启动 Filebeat

```shell script
sudo filebeat setup
sudo service filebeat start
```

## 安装 ELK

推荐使用 `docker`，参照 [docker-elk](https://github.com/deviantony/docker-elk).

## 配置 Logstash
修改 ${logstash}/pipeline/logstash.conf 设置 filebeat 的信息: (input.beats.port 需要和 filebeat 中的保持一致，此设置是用来供 filebeat 传输数据的监听接口, output.elasticsearch.hosts/user/password 需要正确设置，elk-docker 中默认为 eleatic/changeme)

```smartyconfig
input {
 
   beats {
        port => 5044
        type => "logs"
   }
}
 
filter {
 
    grok {
        match => {  "message" => "%{IPORHOST:clientip}%{SPACE}%{USER:ident}%{SPACE}%{USER:auth}%{SPACE}\[%{HTTPDATE:timestamp}\]%{SPACE}\"(?:%{WORD:verb}%{SPACE}%{NOTSPACE:request}(?:%{SPACE}HTTP/%{NUMBER:httpversion})?|%{DATA:rawrequest})\"%{SPACE}%{NUMBER:response}%{SPACE}(?:%{NUMBER:bytes}|-)(?:%{SPACE}(?:%{NUMBER:duration}|-)%{SPACE}(?:-|%{NOTSPACE:header-key})%{SPACE}(?:-|%{NOTSPACE:header-signature})|)" }
    }
 
    if "_grokparsefailure" not in [tags] {
        date {
            match => [ "timestamp" , "dd/MMM/yyyy:HH:mm:ss Z" ]
        }
 
        mutate {
           remove_field => ["message"]
           convert => ["bytes", "integer"]
           convert => ["duration", "integer"]
        }
    }
}
 
output {
    elasticsearch {
        hosts => "elasticsearch:9200"
        user => "elastic"
        password => "changeme"
        index => "apache-access-log"
    }
    stdout { codec => rubydebug }
}
```

在匹配 tomcat access 日志中，我们修改了默认的 pattern，在此例中，我们的 tomcat  access log pattern 为

```smartyconfig
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"               
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot;  %s %b %D  %{header-key}i  %{header-signature}i" />
```

其中，`header-key` 和 `header-signature` 为我们在程序中加到 HTTP Header 中的属性，例如，以下为一条 log。

```smartyconfig
127.0.0.1 - - [18/Aug/2019:18:22:40 -0700] "POST /monitor/test HTTP/1.1"  200 111 21  49c04731-3510-4020-b012-b24t64434ca4  412c473b-3550-4020-b012-b023064434ca4
```

## 配置 Kibana
接下来，我们的工作就完成了，当日志发生变动时，`Filebeat` 会将日志传输给 `Logstash`，`Logstash` 会根据我们定义的 Pattern 将日志进行装换，然后存入 `ElasticSearch`，我们在 `Kibana` 中刷新拿到 `ElasticSearch` 中的 index 就可以配置我们想要的报表了。


---
> **标题**：[使用 ELK 监控 Tomcat Access Log](https://dengkaiting.com/2019/09/17/使用-ELK-监控-Tomcat-Access-Log/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[使用 ELK 监控 Tomcat Access Log](https://dengkaiting.com/)
> **时间**：2019-09-17
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。