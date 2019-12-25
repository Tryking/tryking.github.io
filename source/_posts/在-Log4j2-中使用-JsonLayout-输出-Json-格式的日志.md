---
title: 在 Log4j2 中使用 JsonLayout 输出 Json 格式的日志
toc: true
date: 2019-12-25 18:32:08
tags:
category:
thumbnail:
---
如果我们需要将日志集成到 ELK 中，当日志格式是 Json 的时候，会方便我们的解析。幸运地是，Log4J2 中提供了 Json 这种格式的日志 Layout。当我们设置 Layout 为 JsonLayout 时，此时生成的日志就是 Json 格式。
<!--more-->
## 使用

JsonLayout 的使用方式如下。

首先我们创建 log4j2.xml 文件。我们只是将 PatternLayout 换成了 JsonLayout。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <JsonLayout/>
        </Console>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```
然后我们还需要添加 Jackson 的依赖（log4j2 的依赖当然也不能少）：

```
compile group: 'com.fasterxml.jackson.core', name: 'jackson-databind', version: '2.10.1'
```

最后，我们编写测试代码。

```Java
public class testLog {
    final static Logger logger = LogManager.getLogger(testLog.class);
    public static void main(String[] args) {
        logger.info("test log");
    }
}
```

运行代码后，我们可以看到控制台输出的日志：

```log
{
  "thread" : "main",
  "level" : "INFO",
  "loggerName" : "testLog",
  "message" : "test log",
  "endOfBatch" : false,
  "loggerFqcn" : "org.apache.logging.log4j.spi.AbstractLogger",
  "threadId" : 1,
  "instant" : {
    "epochSecond" : 1577265222,
    "nanoOfSecond" : 33000000
  },
  "threadPriority" : 5
}
```
可以看到，日志将 thread 等关键信息都打印出来了。但是，这里时间显示的时间戳好像有点不友好，后面我们将打印新的格式化后的时间。

## 参数设置
JsonLayout 还提供了很多参数设置。

| 参数名	| 类型 	| 描述 	|
| :-----| ----: | :----:|
|charset| String| 转换成一个 byte 数组时使用的字符集。改值必须是一个合法的 Charset。如果没有指定，将默认使用 UTF-8。 |
| compact|boolean | 如果设置为 true，appender 将不使用行尾换行，并且会对Json日志进行压缩。默认为 false。 |
|eventEol|boolean|如果设置为 true，appender 将在每条记录后 appender 一个行尾换行，默认为 false。使用 eventEol=true 以及 compact=true 可以让每条日志独占一行。|
|endOfLine|String|如果设置了，会覆盖默认的行尾字符串。例如，设置它为“\n”，并且设置 eventEol=true,compact=true，每行结果将被"\n" 分隔（代替 \t\n）。默认是 null（不设置）。|
|complete|boolean|如果设置为 true，appender 将包含Json 的 header ， footer以及每条日志间的逗号，默认为 false。|
|properties|boolean|如果设置为 true，appender 将在生成的 Json 中包含线程上下文 map 信息，默认是 false。|
|propertiesAsList|boolean|如果设置为 true，线程上下文map将作为一个map 实体对象列表。每个实体对象有一个“key”属性和一个“value”属性。默认为 false，这种情况下，线程上下文map是一个简单的key-value对的map。|
|locationInfo|boolean|如果设置为 true，appender 将在生成的 Json 中包含 location 信息，默认是 false。生成 location information 是一个比较耗能的操作，可能会影响性能，应当谨慎使用。|
|includeStacktrace|boolean|如果设置为 true，将输出 Throwable 的完整堆栈。（可选，相当于打印出异常，默认为true ）|
|stacktraceAsString|boolean|是否将堆栈信息格式化为 string，而不是嵌套的对象。（可选，默认为false）|
|includeNullDelimiter|boolean|每次事件完成后是否包含 NULL 字节。（可选，默认为 false）。|
|objectMessageAsJsonObject|boolean|如果设置为 true。ObjectMessage 将被序列化为一个Json对象放到 输出日志的“message” 域中，默认是 false。|

## 添加格式化展示时间日志
对于 JsonLayout， 可以添加子元素 KeyValuePair 来增加更多的属性。比如，我们想添加一个格式化时间的话，我们只需要添加一个 KeyValuePair。

```xml
<JsonLayout>
    <KeyValuePair key="timestamp" value="$${date:yyyy-MM-dd-HH:mm:ss.SSSSS}"/>
</JsonLayout>
```
## 打印对象
我们在程序中有时需要将对象打印出来，在 Log4J 中也是支持直接打印对象的。

```
public class testLog {
    final static Logger logger = LogManager.getLogger(testLog.class);
    final static Marker MARKER_WHITESPACE = MarkerManager.getMarker("ANA_WHITESPACE");


    public static void main(String[] args) {
        final Person person = new Person();
        person.name = "Jack";
        person.isMan = true;
        logger.info("test log");
                // 会将对象打印出来。
        logger.info(MARKER_WHITESPACE, person);
        logger.info(MARKER_WHITESPACE, person.toString());
        Map<String, Object> map = new HashMap<>(16);
        map.put("orig", "msg_origValue");
        // 会将对象打印出来。
        map.put("person", person);
        logger.info(MARKER_WHITESPACE, map);
    }


    static class Person {
        String name;
        boolean isMan;
        @Override
        public String toString() {
            return "Person{" +
                    "name='" + name + '\'' +
                    ", isMan=" + isMan +
                    '}';
        }
    }
}
```


---
> **标题**：[在-Log4j2-中使用-JsonLayout-输出-Json-格式的日志](https://dengkaiting.com/2019/12/25/在-Log4j2-中使用-JsonLayout-输出-Json-格式的日志)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-12-25
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。