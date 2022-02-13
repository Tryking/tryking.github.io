---
title: Spring WebClient 使用简介
toc: true
tags:
  - Spring
  - Java
category:
  - Spring
date: 2021-02-12 13:06:19
thumbnail:
---
现在，越来越多的项目都开始使用反应式编程以及异步处理请求了。在 `Spring 5`中，引入了反应式 `WebClient`实现作为 `WebFlux` 框架的一部分。今天，我们就来学习下如何使用 `WebClient`反应式地请求 REST API。
<!--more-->
# 定义 REST API
首先，我们先定义一些 `REST API`（假设我们数据库里保存了一系列的事件，这些事件有id、属性、分类及标签等）：

* /events - 获取所有的事件
* /events/[id] - 通过 id 获取事件
* /events/[id]/atrributes/[attributeId] - 通过属性id获取某个事件的属性
* /events?name=[name]&startDate=[startDate] - 根据给定条件获取事件
* /events?tag[]=[tag1]&tag[]=[tag2]	-	根据标签获取事件
* /events?category=[category1]&category=[category2]	- 根据分类获取事件

以上，我们定义了一些不同的 `URI`。等下，我们就来看下如何使用 `WebClient` 来构建和发送每种类型的 `URI`。

需要注意的是，通过标签和分类查找事件都包含了数组查询参数，但是它们的语法不同。因为在 `URI` 中数组的表示没有严格定义，这主要取决于服务端的实现。在这里，我们两种方式都覆盖一下。

# WebClient 设置
首先，我们需要创建一个`WebClient`实例。在这篇文章中，我们使用 `mocked` 的对象来验证是否请求了一个有效的 `URI`。

我们先定义一个 client 以及相关的 mocked 对象。

```Java
this.exchangeFunction = mock(ExchangeFunction.class);
ClientResponse mockResponse = mock(ClientResponse.class);
when(this.exchangeFunction.exchange(this.argumentCaptor.capture())).thenReturn(Mono.just(mockResponse));
this.webClient = WebClient
		.builder()
		.baseUrl("https://example.com/api")
		.exchangeFunction(exchangeFunction)
		.build();
```

在上面的定义中，我们设置了一个参数 `baseUrl`，webClient 会将这个参数的值添加到它发送的所有请求之前。

最后，要验证特定的 URI 是否已经传递给底层的 ExchangeFunction 实例，我们需要使用以下方法：

```Java
private void verifyCalledUrl(String relativeUrl) {
	ClientRequest request = this.argumentCaptor.getValue();
	Assert.assertEquals(String.format("%s%s", BASE_URL, relativeUrl, request.url().toString());
	Mockito.verify(this.exchangeFunction).exchange(request);
	verifyNoMoreInteractions(this.exchangeFunction);
}
```

`WebClientBuilder` 类具有将 UriBuilder 实例作为参数提供的 uri() 方法。通常，API 调用通过以下方式进行：

```Java
this.webClient.get()
		.uri(uriBuilder -> uriBuilder
		// ... builder a URI
		.build())
	.retrieve());
```

后面，我们将广泛使用 `UriBuilder` 来构建 `URI`。需要注意的是，我们可以使用任何其它方式构建 URI，然后将生成的 URI 作为字符串传递进去。

# URI 路径构成

URI 路径构成由一系列的由斜杠(/)分隔的路径段组成。首先，我们先看下最简单的没有任何可变段的`/events`简单案例。

```Java
this.webClient.get()
	.uri("/events")
	.retrieve();
verifyCalledUrl("/events");
```

在这个例子中，我们仅传递了一个String类型的数据作为参数。

接着，我们使用 `/events/{id}` 访问点并构建相应的 URI：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events/{id}")
		.build(2))
	.retrieve();
verifyCalledUrl("/events/2");
```

从上面的代码中，我们可以看到实际的 {id} 值 2 被传递给了 biild() 方法。

同样我们可以为 `/events/{id}/attributes/{attributeId}` 访问点创建一个包含多个路径段的 URI：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events/{id}/atrributes/{attributeId}")
		.build(3, 12))
	.retrieve();
verifyCalledUrl("/events/3/attributes/13");
```

在最终的 URI 长度没有超出限制的情况下，一个 URI 可以有很多路径段。我们只需要确保传递给 build() 方法的实际字段值的顺序需要正确。

# URI 查询参数

通常情况下，一个查询参数是一个简单的键值对，比如 name=dengkaiting。我们来看下如何构建这样的 URI。

## 单值参数
我们从单值参数开始，采用 `/events?name=[name]&startDate=[startDate]`访问点。要设置查询参数，我们需要调用 `UriBuilder` 接口的 `queryParam()`方法：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events")
		.queryParam("name", "InitFailed")
		.queryParam("startDate", "13/02/2021")
		.build())
	.retrieve();
verifyCalledUrl("/events?name=InitFailed&startDate=13/02/2021")
```

我们添加了两个查询参数并给他们设置了实际值。此外，我们也可以使用占位符而不立即设置实际值：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events")
		.queryParam("name", "{name}")
		.queryParam("startDate", "{startDate}")
		.build("InitFailed", "13/02/2021"))
	.retrieve();
verifyCalledUrl("/events?name=InitFailed&startTime=13%2F02%2F2021")
```

当我们需要在调用链中进一步传递参数时，后面这种方式就比较方便了。上面两个代码片段里有一个重要的区别：
我们可以看到对于预期的 URI，它们两个的编码方式是不同的。在后面这个例子中，斜线（/）被转义了。一般来说，`RFC3986`不需要在查询中对斜杠进行编码。但是，某些服务端应用可能需要这种转换。我们在后面会介绍下如果更改此行为。

## 数组参数
有时，我们可能需要传递一个值数组。其实，在查询字符串中传递数组并没有严格的限制。对于数组的表示通常取决于底层框架。下面，我们介绍最广泛使用的格式。

我们以 `/events?tag[]=[tag1]&tag[]=[tag2]`访问点开始：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events")
		.queryParam("tag[]", "node", "service")
		.build())
	.retrieve();
verifyCalledUrl("/events?tag%5B%5D=node&tag%5B%5D=service")
```

最终的 URL 包含多个标记参数，后面紧跟编码后的方括号。`queryParam()`方法接受可变参数作为值，因此我们不需要多次调用该方法。

同样地，我们还可以省略方括号，只传递具有相同键但值不同的多个查询参数 - `/events?category=[category1]&category=[category2]`


```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events")
		.queryParams("category", "info", "warn")
		.build())
	.retrieve();
verifyCalledUrl("/events?category=info&category=warn")
```

还有一种更广泛使用的对数组进行编码的方法是传递逗号分隔的值。我们把前面的示例转为逗号分隔值：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder
		.path("/events")
		.queryParam("category", String.join(",", "info", "warn"))
		.build())
	.retrieve();
verifyCalledUrl("/events?category=info,warn");
```

我们只是使用 String 类的 join() 方法创建了一个逗号分隔的字符串。当然，我们可以使用应用期望的任何其它分隔符。

# 编码模式

我们在上面提到了 URL 的编码。

如果默认行为不符合我们的要求，我们可以更改它。我们在创建`WebClient`实例的时候，可以提供一个 `UriBuilderFactory` 的实现来更改默认的编码模式。这里，我们使用 `DefaultBuilderFactory`类。要设置编码，需要调用 `setEncodingMode()` 方法。可以使用的模式有：

* TEMPLATE_AND_VALUES：对 URI 模板进行预编码，扩展时对 URI 变量进行严格编码
* VALUES_ONLY: 不对 URL 模板进行编码，而是将 URI 变量展开成模板后严格编码
* URI_COMPONENTS：扩展 URI 变量后编码 URI 的组件值
* NONE：不会应用任何编码

默认值是 `TEMPLATE_AND_VALUES`。我们把模式设置成 `URI_COMPONENTS`。

```Java
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(BASE_URL);
factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.URI_COMPONENT);
this.webClient = WebClient
	.builder()
	.uriBuilderFactory(factory)
	.baseUrl(BASE_URL)
	.exchangeFunction(exchangeFunction)
	.build();
```

最终，下面的断言可以成功：

```Java
this.webClient.get()
	.uri(uriBuilder -> uriBuilder)
		.path("/events")
		.queryParam("name", "InitFailed")
		.queryParam("startDate", "13/02/2021")
		.build()
	.retrieve();
verifyCalledUrl("/events?name=InitFailed&startDate=13/02/2021");
```

当然，我们也可以提供一个完全自定义的 URIBuilderFactory 实现来手动处理 URI 创建。

# 结论
在这篇文章中，我们了解了如何使用 `WebClient` 和 `DefaultUriBuilder` 构建不同类型的 URI。在此过程中，我们介绍了各种类型和格式的查询参数。最后，我们更改了 URL 构建器的默认编码模式。


---
> **标题**：[Spring WebClient 使用简介](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2021-02-12
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。