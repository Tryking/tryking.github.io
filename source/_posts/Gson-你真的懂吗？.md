---
title: Gson - 你真的懂吗？
toc: true
date: 2019-07-24 23:04:17
tags:
category:
thumbnail:
---
平时使用 `Gson` 可能也就使用下基本功能，但是你对 `Gson` 真的了解吗？

<!--more-->

## 对于含有内部类的嵌套类序列化
对于静态嵌套类， `Gson` 可以非常容易地进行序列化。但是对于纯内部类，`Gson` 不能进行反序列化，因为它们的无参构造函数还要对反序列化时不可用的 Object 进行引用。比如，当反序列化 Hand 时，需要引用 Person，但是此时 Person 不能被引用。

```
public class Person {
    private Hand hand;

    private class Hand {
        private String thumb;
        
    }
}
```
解决办法有两种：
* 指定内部类为静态类，
* 给内部类提供一个自定义的实例生成器。

```
public class InstanceCreatorForHand implements InstanceCreator<Person.Hand> {
  private final Person person;
  public InstanceCreatorForHand(Person person)  {
    this.person = person;
  }
  public Person.Hand createInstance(Type type) {
    return person.new Hand();
  }
}
```

## 数组实践

* 序列化

```Java
Gson gson = new Gson();
int[] ints = {1, 2, 3, 4, 5};
String[] strings = {"abc", "def", "ghi"};

System.out.println(gson.toJson(ints));
System.out.println(gson.toJson(strings));
```
> print:
> 
> [1,2,3,4,5]
> 
> ["abc","def","ghi"]

* 反序列化

```Java
int[] ints2 = gson.fromJson("[1,2,3,4,5]", int[].class); 
```

### 集合实践

* 序列化

```Java
Gson gson = new Gson();
Collection<Integer> ints = List.of(1, 2, 3, 4, 5);

String json = gson.toJson(ints);
```

> print:
>[1,2,3,4,5]

* 反序列化

```
Type collectionType = new TypeToken<Collection<Integer>>(){}.getType();
Collection<Integer> ints2 = gson.fromJson(json, collectionType);
```

### 集合局限性

* 可以序列化任意类型的集合，但是不能从其进行反序列化。
	* 因为没有方法指定结果对象的类型。
* 当反序列化的时候，集合必须是特定的泛型类型。

> 上面提到的这些都是有意义的，如果遵循良好的 Java 编码规范，基本不会出现问题。

## JsonElement
 	
该类为一个抽象类，像 `JsonArray`, `JsonObject`, `JsonPrimitive` 以及 `JsonNull` 都继承自它。

当我们想要判定某个 Json 是否为 `JsonObject` 时，可以用 

```Java
public boolean isJsonObject() {
  return this instanceof JsonObject;
}
```

此方法来实现，其他三个实现类也有同样实现。

我们还可以使用 `getAsJsonObject()` 方法将当前 `JsonElement` 以 JsonObject 形式返回，如果它不是 JsonObject，则报错。其他三个同理。

### 使用示例

#### 基本使用


```Java
public class GsonTest {
    public static void main(String[] args) {
        GsonTest gsonTest = new GsonTest();
        JsonElement jsonObject = gsonTest.getJsonObject("{\"A\":\"B\"}");
        JsonObject asJsonObject = jsonObject.getAsJsonObject();
        System.out.println(asJsonObject);
        JsonArray asJsonArray = jsonObject.getAsJsonArray(); // 报错
        System.out.println(asJsonArray);

        Gson gson = new Gson();
        JsonArray aaa = gson.fromJson("[\"a\",\"aa\"]", JsonArray.class);
        System.out.println(aaa);

        JsonObject bbb = gson.fromJson("[\"a\",\"aa\"]", JsonObject.class); //报错
    }

    private JsonElement getJsonObject(String s) {
        try {
            Gson gson = new Gson();
            JsonElement element = gson.fromJson(s, JsonElement.class);
            return element;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
```

#### 解析 JsonArray

```Java
@SuppressWarnings("unchecked")
    public <T> Object parseAsArrayList(String serializedData, T type) {
        ArrayList<T> newArray = new ArrayList<T>();
        Gson gson = new Gson();

        JsonElement json = new JsonParser().parse(serializedData);
        JsonArray array = json.getAsJsonArray();
        Iterator<JsonElement> iterator = array.iterator();

        while (iterator.hasNext()) {
            JsonElement json2 = iterator.next();
            T object = (T) gson.fromJson(json2, (Class<?>) type);
            newArray.add(object);
        }

        return newArray;
    }
```



---
> **标题**：[Gson - 你真的懂吗？](https://dengkaiting.com/2019/07/24/Gson - 你真的懂吗？/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：{{ date }}
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。