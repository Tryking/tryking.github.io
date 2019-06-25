---
title: Json Schema 是什么？
date: 2019-06-25 22:29:25
tags: 
- Json Schema
- API
---
简单说，`Json Schema` 其实就是一个标准的 Json 串，它以一个 Json 串来描述我们需要的数据规范，并且支持注释以及验证 Json 文档，即我们可以用 Json Schema 来验证所给的 Json 串是否满足我们需要的数据格式规范。 

同样能用来表示数据的还有一种格式 XML，为什么 Json Schema 偏偏要用 Json 来进行表示数据呢？对于机器，其实这两种方式是没有区别的，机器只要你把标准给了它，它都能用很快的速度识别出来（相对于我们人），但是 XML 对于人识别就太不友好了。比如，假设我们需要描述一个班级的两个人：

对于 XML：

```
<class>
	<name>实验1班</name>
	<no>1801</no>
	<students>
	    <student>
	        <name>张三</name>
	        <sex>女</sex>
	    </student>
	    <student>
	        <name>李四</name>
	        <sex>男</sex>
	    </student>
	</students>
</class>
```
使用 Json：

```
{
  "class": {
    "name": "实验1班",
    "no": "1801",
    "students": {
      "student": [
        {
          "name": "张三",
          "sex": "女"
        },
        {
          "name": "李四",
          "sex": "男"
        }
      ]
    }
  }
}
```
有没有觉得 Json 立马秒杀 XML？这里可能感觉还不是很明显，这是因为层级比较少，层级再多之后，Json 的优势立马就显现出来了。

Json Schema 在我们平时的工作中最常用的有两个，一个就是上面说的用于验证 Json 串的合法性；另一个就是用于定义我们的 API，定义好 API 后，我们可以直接用工具生成我们的 API，这样利于我们对 API 的维护。

## 验证 Json 串的合法性
比如，我们定义的 Json Schema 为：

```
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "Product",
    "description": "A product from Acme's catalog",
    "type": "object",
    "properties": {
        "id": {
            "description": "The unique identifier for a product",
            "type": "integer"
        },
        "name": {
            "description": "Name of the product",
            "type": "string"
        },
        "price": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        }
    },
    "required": ["id", "name", "price"]
}
```
在上述 Json Schema 中

* 最上面的 `$shcema` 是一个关键字，它表示我们所定义的 Schema 和 	`http://json-schema.org/draft-04/schema#`（Json Schema 的 v4 规范）是一致的
* `title` 指的是标题。
* `description` 用于描述我们所定义的 Schema，上述表明我们定义的是一个来自 Acme 目录的商品。
* `type` 表示我们定义的是一个 `object` 对象。
* `properties` 中就是 Schema 的属性了，这里面的是核心。我们可以看到该 Schema 一共有三个属性，分别是 id`(integer)`, name`(string)`, prince`(number)`。
* 最后的 `required` 表明三个属性都是必须的。

给定了上述 Schema，我们就可以验证给定的 Json 是否是合规的了。比如：

```
{
  "id": 1,
  "name": "watermelon"
}
```
显然，这个 Json 缺少了一个属性 price，所以它不合规。

```
{
  "id": 1,
  "name": ["knife", "spoon"],
  "price": 4
}
```
这个 Json 的 name 属性是一个数组，我们上面规定 name 只能是 String，显然这个也不是合规的。

```
{
  "id": 1,
  "name": "watermelon",
  "price": 4
}
```
这个，就满足了上面定义的所有规则，因此这个是一个合规的 Json。

## 定义 API
其实，使用我们上面的 Json Schema 便能进行 API 的定义了，只不过是定义 API 的话可能还需要更多的支持。比如，对于 Java，我们需要能实现 extend 等关键字的支持，还需要能进行枚举 enum 类型等的定义。这里只简单使用上述的内容显然不够了，我们还需要扩充一些关键字的使用。

目前，大家使用最多的将 Json Schema 转换为 Java Bean 的一个库是 [jsonschema2pojo](https://github.com/joelittlejohn/jsonschema2pojo)，后面我将依托这个库支持的内容对 Json Schema 的格式进行深入解析，此库支持的也是比较通用的。

































