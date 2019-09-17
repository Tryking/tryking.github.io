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
其实直接使用 ELK 便可以进行监控，使用 Logstash 把对应的日志处理，然后放到 ElasticSearch 中，最后再用 Kibana 进行展示。但是对于生产环境来说， Logstash 还是比较耗性能的。比较理想的做法是使用 Filebeat。

`Filebeat` 属于 `Beats` 家族，`Beats` 是单用途数据托运平台。它们以轻量级代理的形式存在于服务器上，并将来自成百上千台机器的数据发送到 `Logstash` 或 `Elasticsearch`。Filebeat 也可以对数据进行处理，然后直接存入 ES，但是考虑到对机器性能的影响，我更喜欢它将原始数据直接发送到 Logstash（和 Filebeat 不在相同机器），然后用 Logstash 将数据处理并放入 ES 中。

因此，监控的流程为 `Filebeat` 收集数据，将数据发送到 `Logstash`，然后 `Logstash` 对数据进行处理，并将处理后的数据发送到 `ES`，最后再用 `Kibana` 进行数据展示。

## 安装并配置 Filebeat

## 安装 ELK

## 配置 Logstash

## 配置 Kibana


---
> **标题**：[使用 ELK 监控 Tomcat Access Log](https://dengkaiting.com/2019/09/17/使用-ELK-监控-Tomcat-Access-Log/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[使用 ELK 监控 Tomcat Access Log](https://dengkaiting.com/)
> **时间**：2019-09-17
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。