---
title: 使用 PowerMockito 测试
toc: true
date: 2019-11-07 13:19:29
tags:
category:
thumbnail:
---
PowerMockito 是 Powermock 集成的 Mockito2 ，可以用来模拟对象进行测试。

<!--more-->

首先，我们需要添加依赖。

```grovee
testCompile 'org.powermock:powermock-module-junit4'
testCompile 'org.powermock:powermock-api-mockito2'
```

## Mock 方法

测试方法：

```Java
public class Math {
    public int add(int i, int j) {
        return i + j;
    }
}
```

假如我们需要让上面的 `add(int i, int j)` 方法无论传入什么参数，都返回固定的值，我们可以这样做。

```Java
public class MathTest {
    @Test
    public void test() {
        Math math = new Math();
        int original = math.add(4, 5);
        System.out.println("original:" + original);

        final Math spyMath = PowerMockito.spy(math);
        PowerMockito.when(spyMath.add(anyInt(), anyInt())).thenReturn(0);
        System.out.println("spy:" + spyMath.add(4, 5));
    }
}
```

控制行将会打印以下日志：
```log
original:9
spy:0
```

## Mock 静态方法


---
> **标题**：[使用 PowerMockito 测试](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2019-11-07
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。