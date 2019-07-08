---
title: 使用 Json Schema 定义 API
date: 2019-06-25 23:37:24
tags:
- Json Schema
- API
- Java
---
前面我们介绍了 `Json Schema` 的基本内容，这篇文章我们结合 `jsonschema2pojo` 工具深入分析如何使用 `Json Schema` 生成 API，学习更多关于 `Json Schema` 的关键字等知识。
<!--more-->
`jsonschema2pojo` 该库提供了多种使用`Json Schame`文件生成 Java 类的方法，比如 `Maven`插件, `Gradle`插件, `Ant`任务, 以及直接使用命令行，甚至还可以在代码中直接使用，具体参照 [jsonschema2pojo Getting Started](https://github.com/joelittlejohn/jsonschema2pojo/wiki/Getting-Started)

这里我直接采用 Mac 命令行的方式，在 Mac 下安装此命令的方式比较简单，直接运行 `brew install jsonschema2pojo` 安装即可。

## properties
在一个类中，最关键的就是属性了，每个类都可能有多个属性，在 `Json Schema` 中就是通过 `properties` 来定义类的属性的， properties 中的每个条目都是所定义类的一个属性。

比如，对于此 Json Schema `MyObject.json`：

```
{
    "type" : "object",
    "properties" : {
        "foo" : {
            "type" : "string"
        }
    }
}
```
我们执行 `jsonschema2pojo` 任务后，可以生成对应的 Java 类：

```
public class MyObject {
    private String foo;
    public String getFoo() {
       return foo;
    }
    public void setFoo(String foo) {
       this.foo = foo;
    }
}
```
## type
像我们 Java 中有多种类型，那不同的类型在 Json Schema 中如何表示呢？一般通用的转换如下所示，这也是 jsonschema2pojo 工具默认使用的转换方式：

Schema Type | Java Type
	:-: | :-: 
string | java.lang.String 
number | java.lang.Double
integer| java.lang.Integer
boolean| java.lang.Boolean
object | 自己生成的类
array | java.util.List
array(with "uniqueItems":true)|java.util.Set
null | java.lang.object
any | java.lang.object

值的注意的是，如果我们增加了 `usePrimitives` 选项，对于 `Integer, Double, Boolean` 这三个包装类将会转换成基本类型 `int, double, boolean`。

## additionalProperties
我们平时开发中，为了类利于扩展，有时会给类增加一个`Map`类型的属性，这样当外部需要传更多的参数给我们时，不需要更改API，直接将参数放到这个 `Map` 里就可以快速实现。`jsonschema2pojo`同样也实现了这个功能，当我们没有指定`additionalProperties`属性为`false`或者没有指定`additionalProperties`属性时，`jsonschema2pojo`会为我们定义的类自动生成一个类型为`Map`的`additionalProperties`属性。

比如：

```
{
    "type" : "object"
}
```

或者

```
{
    "type" : "object",
    "additionalProperties" : {}
}
```

生成的类：

```
public class MyObject {
    private java.util.Map<String, Object> additionalProperties = new java.util.HashMap<String, Object>();

    @org.codehaus.jackson.annotate.JsonAnyGetter
    public java.util.Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @org.codehaus.jackson.annotate.JsonAnySetter
    public void setAdditionalProperties(String name, Object value) {
        this.additionalProperties.put(name, value);
    }
}
```
## items

`items` 用于指定我们定义 `List` 以及 `Set` 类型时的子元素详情，比如子元素的类型以及描述等。
例如：

```
{
    "type" : "object",
    "properties" : {
        "myArrayProperty" : {
            "type" : "array",
            "items" : {
                "type" : "string"
            }
        }
    }
}
```

生成的属性：

```
List<String> myArrayProperty;
```
## required
如果一个属性在`required`中指定了，那么这个属性会有一个 `Required` 的注解，表明该属性是必需的。

## uniqueItems
这个就是我们上面表格中的用于区分 `List` 和 `Set` 的关键字了，如果我们定义的`array`中声明`uniqueItems`为`true`，那么最终转换为的属性的类型就为`Set`。

## enum
对于枚举类型的定义需要使用到此关键字，比如：

```
{
    "type" : "object",
    "properties" : {
        "myEnum" : {
            "type" : "string",
            "enum" : ["one", "secondOne", "3rd one"]
        }
    }
}
```

生成的枚举类：

```
@Generated("com.googlecode.jsonschema2pojo")
    public static enum MyEnum {

    ONE("one"),
    SECOND_ONE("secondOne"),
    _3_RD_ONE("3rd one");
    private final String value;

    private MyEnum(String value) {
        this.value = value;
    }

    @JsonValue
    @Override
    public String toString() {
        return this.value;
    }

    @JsonCreator
    public static MyObject.MyEnum fromValue(String value) {
        for (MyObject.MyEnum c: MyObject.MyEnum.values()) {
            if (c.value.equals(value)) {
                return c;
            }
        }
        throw new IllegalArgumentException(value);
    }
}
```
## default

如果我们需要某个属性有默认值，可以加上此参数，生成类的属性会自动实例化。具体可参照下表：

Json Schema | Java
	:-: | :-: 
myString : { "type":"string", "default":"abc"} | myString : { "type":"string", "default":"abc"};
myInteger : { "type":"integer", "default":"100"} | private Integer myInteger = 100;
myNumber : { "type":"number", "default":"10.3"}|private Double myNumber = 10.3D;
myMillis : { "type":"string", "format":"utc-millisec", "default":"500"}|private Long myMillis = 500L;
myDate : { "type":"string", "format":"date-time", "default":"500"}|private Date myDate = new Date(500L);
myDate : { "type":"string", "format":"date-time", "default":"2011-02-24T09:25:23.112+0000"}|private Date myDate = new Date(1298539523112L);
myList : { "type":"array", "default":["a","b","c"]}|private List<String> myList = new ArrayList<String>(Arrays.asList("a","b","c"));

## title && description
`title` 和 `description` 用于描述一个属性，当我们指定了这两个参数时，`jsonschema2pojo`
会在属性的上面生成 Java 文档，并且`title`在`description`之上。

## format
`format` 是`jsonschema2pojo` 提供给我们扩展更多类型的一个参数，在上面介绍的`type`中可以看到我们生成的 Java 类型并不多，像 Date 等这些参数都没有，但是当我们加上 `jsonschema2pojo `能识别的`format`参数后，就可以扩展我们的属性类型，具体参照：

Format value | Java Type
	:-: | :-: 
"date-time"	| java.util.Date
"date"	| String
"time"	| String
"utc-millisec"	| long
"regex"	| java.util.regex.Pattern
"color"	| String
"style"	| String
"phone"	| String
"uri"	| java.net.URI
"email"	| String
"ip-address"	| String
"ipv6"	| String
"host-name"	| String
"uuid"	| java.util.UUID

## extends
使用`extends`关键字可以实现 `Java` 中的继承。
比如，我们定义 `flower.json`

```
{
   "type" : "object"
}
```

然后定义 `rose.json`，使其继承自 `flower`

```
{
    "type" : "object",
    "extends" : {
        "$ref" : "flower.json"
    }
}
```

最终我们生成的 Rose.java 为以下内容：

```
public class Rose extends Flower {
    ....
}
```

## $ref

`$ref`关键字用于指定某一个属性的引用来源，在`jsonschema2pojo`中支持以下协议：

* http://, https://
* file://
* classpath:, resource:, java: (all synonyms used to resolve schemas from the classpath).

我们定义 API 的时候一般是需要引用到其他我们定义的 `Json Schema` 文档。比如：

```
{
   "type" : "object",
   "properties" : {
      "loggedInUser" : {
          "$ref" : "user.json"
      }
   }
}
```
表明`loggedInUser`属性的类型是一个由`user.json`定义的类型。

```
{
   "description" : "Tree node",
   "type" : "object",
   "properties" : {
      "children" : {
         "type" : "array",
         "items" : {
             "$ref" : "#"
         }
      }
   }
}
```

这个表明 `children` 属性引用的是该 object 自身，所以这可以生成一个 Tree 类型的类。

```
public class TreeNode {
   public List<TreeNode> getChildren() {
   ...}

   public void setChildren(List<TreeNode> children) {
   ...}
}
```

## 更多

* javaEnumNames

	```
	{
	    "type" : "object",
	    "properties" : {
	        "foo" : {
	            "type" : "string",
	            "enum" : ["H","L"],
	            "javaEnumNames" : ["HIGH","LOW"]
	        }
	    }
	}
	```
		
	生成的类：
		
	```
	public enum Foo {
	    HIGH("H"),
	    LOW("L")
	    ...
	}
	```

* javaInterfaces
	
	```
	{
	    "javaInterfaces" : ["java.io.Serializable", "Cloneable"],
	    "type" : "object"
	}
	```
		
	生成的类：
		
	```
	public class FooBar implements Serializable, Cloneable
	{
	...
	```

* javaName

	```
	{
	  "type": "object",
	  "properties": {
	    "a": {
	      "javaName": "b",
	      "type": "string"
	    }
	  }
	}
	```
		
	生成的类：
		
	```
	public class MyClass {
	    @JsonProperty("a")
	    private String b;
		
	    @JsonProperty("a")
	    public String getB() {
	        return b;
	    }
		
	    @JsonProperty("a")
	    public void setB(String b) {
	        this.b = b;
	    }
	}
	```
	
## 声明

> 本文绝大部分内容是引用的 `jsonschame2pojo` 的文档，更多内容请看官方文档 [jsonschema2pojo](http://www.jsonschema2pojo.org/).
