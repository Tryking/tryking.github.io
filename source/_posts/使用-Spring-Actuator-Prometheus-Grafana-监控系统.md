---
title: 使用 Spring Actuator + Prometheus + Grafana 监控系统
toc: true
date: 2019-12-23 22:26:46
tags:
category:
thumbnail:
---
Spring Boot 有个 Actuator，它可以为应用提供强大的监控能力。从 Spring Boot 2.0 开始，Actuator 将底层更改为了 Micrometer，使得 Actuator 能提供更加强大，更加灵活的监控能力。Micrometer 是一个类似门面的监控系统，可以把它看做是监控界的 `Slf4j`。

<!--more-->

借助 Micrometer，我们的应用可以对接各种各样的监控系统。在这篇文章这种，我们演示下如何对接 `Prometheus`，对接完 `Prometheus`后，我们使用 `Grafana` 来实现数据的可视化效果。

## 集成 Prometheus
### 增加依赖

首先，我们创建 Spring Boot 项目，并增加以下依赖。

```
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
```
在这里，我们引入了 `micrometer-registry-prometheus`，引入后 `Micrometer` 便可以对接 `Prometheus`。

### 写配置
在 `application.yml` 中增加以下配置：

```
server:
  port: 8080
spring:
  application:
    name: prometheus-test
management:
  endpoints:
    web:
      exposure:
        include: 'prometheus'
  metrics:
    tags:
      application: ${spring.application.name}
```
### 测试
启动应用，然后访问 `http://localhost:8080/actuator/prometheus`，可以得到如下结果：

```

```


---
> **标题**：[使用 Spring Actuator + Prometheus + Grafana 监控系统](https://dengkaiting.com/2019/12/23/使用 Spring Actuator + Prometheus + Grafana 监控系统)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-12-23
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。