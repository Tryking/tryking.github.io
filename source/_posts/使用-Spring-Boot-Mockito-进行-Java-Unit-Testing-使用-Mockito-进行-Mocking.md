---
title: 使用 Spring Boot & Mockito 进行 Java Unit Testing - 使用 Mockito 进行 Mocking
toc: true
date: 2020-02-10 10:35:18
tags:
category:
thumbnail:
---
单元测试(Unit Testing) 是我们日常开发中非常重要的一环，这篇文章我将告诉大家如何使用 Spring Boot 和 Mockito 进行测试。

<!--more-->

# 使用 Spring Initializr 创建工程

[Spring Initializr](https://start.spring.io/) 可以非常方便地帮助我们创建 Spring Boot 程序，我们只需要选择我们需要的内容生成 zip 压缩包，然后将压缩包导入到 IDEA 中即可。

> 图片

这里，我们仅需要 `Spring Web`，选择 `Spring Boot DevTools` 更加利于我们开发。

选择完成后，我们导出项目，然后导入到 IDE 中。

# 对一个简单的业务服务写单元测试

我们写一个简单的业务方法，然后对其进行测试。

```Java
public class SomeBusinessImpl {

    public int calculateSum(int[] data) {
        int sum = 0;
        for (int value : data) {
            sum += value;
        }
        return sum;
    }
}
```

测试方法（在 IDEA 中，在业务方法中使用快捷键 `Shift + Ctrl + T` 可以快速生成测试方法）：

```Java
@Test
public void calculateSum_basic() {
    SomeBusinessImpl business = new SomeBusinessImpl();
    int actualResult = business.calculateSum(new int[] { 1, 2, 3 });
    int exceptedResult = 6;
    assertEquals(exceptedResult, actualResult);
}

@Test
public void calculateSum_empty() {
    SomeBusinessImpl business = new SomeBusinessImpl();
    int actualResult = business.calculateSum(new int[] {});
    int exceptedResult = 0;
    assertEquals(exceptedResult, actualResult);
}

@Test
public void calculateSum_oneValue() {
    SomeBusinessImpl business = new SomeBusinessImpl();
    int actualResult = business.calculateSum(new int[] { 3 });
    int exceptedResult = 3;
    assertEquals(exceptedResult, actualResult);
}

```
在测试方法中，我们分别对基本的数组，空数组以及仅有一个元素的数组进行了测试，运行测试方法，可以看到测试方法均能正常通过。

# 创建一个调用 Data Service 的业务服务


---

> **标题**：[{{title}}](https://dengkaiting.com/2019/00/00/{{ title }}/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：{{ date }}
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。