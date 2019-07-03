---
title: 使用 Json Schema 定义 Java API 注意事项
date: 2019-07-03 22:35:09
tags:
---
在 []() 这篇文章中，我们介绍了使用 `Json Scehma` 定义 Java API 的方法。使用 Json Schema 虽然可以定义 API，但是有一些方面需要注意。

## 没有直接定义 Map 类型的属性的方法

在 JsonSchema2Pojo 工具中，有一个 additionalProperties 参数，如果我们将此属性的值设为 true，或者设为不是 false，那么该类会自动有一个 Map 类型的属性，属性名就为 additionalProperties。

但是如果我们类中还需要别的 Map 类型的属性，就无法实现了。目前的解决方法是，重新定义一个 Object 类型的类，该类的属性为空，但是有一个 additionalProperties 为 true 的参数。这样，此 Object 就相当于是一个 Map 类型的 Object 了，我们可以在其他的类中进行引用。

比如：<font><color red>(todo reimplement)</color></font>

```Json 
{
    "type" : "object",
    "additionalProperties" : true
    "properties" : {
    	"otherMap" : {
    		"$ref" : "#/defines/"
    	}
    }
}
```

