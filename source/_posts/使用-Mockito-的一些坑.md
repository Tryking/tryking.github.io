---
title: 使用 Mockito 的一些坑
toc: true
date: 2020-03-17 23:34:23
tags:
  - 测试
category:
  - 测试
thumbnail:
---

今天使用 Mockito 遇到一个匪夷所思的问题。
<!--more-->

我们知道，在使用 Mockito 的时候，如果要 Mock 一个方法，需要将其参数也传对，只有参数匹配上了，才能 Mock 到位。

比如，我今天 Mock 的一个方法是这样的：

```Java
Class CallClass {
	public String callMethod(Class A, Class B){
		...
	}
}
```

在代码中调用：

```Java
CallClass c = new CallClass();
c.callMethod(A, null);
```

注意，我在代码中调用方法时对于 B 传入的是一个 null。

然后开始写测试方法了，在测试方法中我 Mock 了 CallClass 方法。

通过以下方式将代码中引用的对象 CallClass 替换掉。


```Java
import static org.mockito.ArgumentMatchers.any;

...

@Mock
private CallClass callClass;

Field cc = *.getClass().getDeclaredField(c);`
cc.setAccessible(true);
cc.set(*, callClass);

```

然后再给方法打桩：

```Java

String mockStr = "mock";

when(callClass.callMethod(any(A.class), any(B.class)).thenReturn(mockStr);
```

结果，在代码调用中返回的结果怎么都不是我想要的 `mockStr` 的结果，甚是郁闷。 经过我的试错大法，最终终于发现了问题所在，`null` 并不能匹配 `any(B.class)`，这里应该使用的是 `ArgumentMatchers.<B>any()`，即

```Java
when(callClass.callMethod(any(A.class), ArgumentMatchers.<B>any()).thenReturn(mockStr);
```

看来还是对 `Mockito` 的文档不是很熟悉，每次都是现用现查，现在尝到苦果了。

---
> **标题**：[Title](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2020-03-17
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。