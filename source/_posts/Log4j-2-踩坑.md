---
title: Log4j 2 踩坑
toc: true
date: 2019-08-26 00:35:50
tags:
category:
	- Java

thumbnail:
---
现在 Log2j 4 基本是 Java 中使用最广泛的日志框架了，记录一些遇到的坑。

<!--more-->

## 如果我们在 log4j2.xml 中使用如下配置，会报错。

```xml
 <Appenders>
        <Appender type="Console" name="STDOUT">
            <Layout type="PatternLayout" pattern="%m MDC%X%n"/>
            <Filters>
                <Filter type="MarkerFilter" marker="FLOW" onMatch="DENY" onMismatch="NEUTRAL"/>
                <Filter type="MarkerFilter" marker="EXCEPTION" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </Appender>
</Appenders>
```

报错：

> 2019-08-23 10:04:25,750 RMI TCP Connection(3)-127.0.0.1 ERROR Error processing element Appender ([Appenders: null]): CLASS_NOT_FOUND

这是因为在 Log4j 2 中，指定 appender 的类型被元素的名称取代了，不能再使用一个 `type` 属性了。我们需要将配置换成下面这种形式。

```xml
<Appenders>
        <Console  name="STDOUT">
            <Layout type="PatternLayout" pattern="%m MDC%X%n"/>
            <Filters>
                <Filter type="MarkerFilter" marker="FLOW" onMatch="DENY" onMismatch="NEUTRAL"/>
                <Filter type="MarkerFilter" marker="EXCEPTION" onMatch="DENY" onMismatch="ACCEPT"/>
            </Filters>
        </Console >
</Appenders>
```

> 注意：`Filter` 标签也是不允许的，参考下面。 

同理，我们还可能会遇到如下报错：

```log
2019-08-23 10:54:48,747 RMI TCP Connection(4)-127.0.0.1 ERROR Console contains an invalid element or attribute "Layout"

2019-08-23 10:54:48,747 RMI TCP Connection(4)-127.0.0.1 ERROR Filters contains an invalid element or attribute "Filter"
```

也是因为我们使用了不正当的标签 `Layout`, `Filter`，log4j2 已经不使用这些标签了，我们需要直接将其替换为 type 对应的标签，而不是使用 type 来指定具体的 `Layout`  和 `Filter`。


## 如果我们的 PatternLayout  设置为 `%m%n`，则在打印异常日志时每行的末尾会将 jar 的信息打出来，比如：

```log
...
at java.net.InetAddress.getAllByName(InetAddress.java:1127) ~[?:1.8.0_201]
	at org.apache.http.impl.conn.SystemDefaultDnsResolver.resolve(SystemDefaultDnsResolver.java:45) ~[httpclient-4.5.2.jar:4.5.2]
	at org.apache.http.impl.conn.DefaultClientConnectionOperator.resolveHostname(DefaultClientConnectionOperator.java:262) ~[httpclient-4.5.2.jar:4.5.2]
...
```

这是因为我们没有显示指定 exception 的 Converter。log4j 会给我们提供一个默认的 `%xEx` ，这个 pattern 包含 jar 包的信息等。如果我们不想让其出现，可以指定我们的 PatternLayout 为 `%m%ex%n`。其中，`%m` 表示 `%message`, `%n` 表示输出换行符。

---
> **标题**：[Log4j 2 踩坑](https://dengkaiting.com/2019/08/26/Log4j-2-踩坑/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-08-26
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。