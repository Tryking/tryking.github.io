---
title: Java Mock 哪家强？Mocktio VS JMockit
toc: true
tags:
  - 测试
category:
  - 测试
date: 2021-05-22 16:34:03
thumbnail:
---

`Mockito` 是当前最流行的 `Java` 单元测试 `Mock` 框架，`JMockit`天然支持静态方法和构造函数的 Mock，到底哪个更好用呢？
<!--more-->

# Mock 介绍
## 为什么要使用 mock
当我们写单元测试时，我们往往只想验证我们所写函数的功能，而不是它的依赖项。但是有时候它的依赖项并不可控。

为了把函数的依赖项剥离，我们就需要为此依赖项提供一个替代品。通过这种方式，我们可以强制依赖项返回特定值，抛出异常，或者将比较耗时的方法减少到固定的值。

这种替代品就是 `mock`，它可以帮我们简化测试编码并减少测试执行时间。

## 到底要不要 mock
不是所有的东西都要被 mock 的。有时候如果 mock 带来的好处并不明显，我们该考虑的是是不是换成集成测试更合理等，而不是强行 mock。

# 测试用例
假设我们有这样一个场景：我们对外提供了一个保存 toDo list 的服务，用户每次访问接口的时候传递 toDo 编号及 toDo 详情信息，然后我们调用 ToDoService 来处理逻辑，在实际的处理中我们需要调用 DAO 层来保存数据。

## 编码实现
首先我们有一个 ToDo 的实体类。

```Java
public class ToDoModel {
    private Long numbering;
    private String toDoDetail;
}
```

在 ToDoDao 里面，我们有一个 save 方法，但是我们不需要具体实现它，我们后面的例子会对它进行 mock。

```Java
public class ToDoDao {
    public int save(ToDoModel toDoModel) {
        return 0;
    }
}
```

在 ToDoService 里，我们同样实现 save 方法，在 save 方法里会调用 Dao 层的 save 方法。且当我们配置了环境变量`STOP_SERVICE`为 `true` 后，我们默认返回保存失败，不进行保存。我们再提供一个返回 void 的 setCurrentNumbering 方法，后面我们测试会用到。

```Java
public class ToDoService {
    private ToDoDao toDoDao;
    private long currentNumbering;

    public boolean save(ToDoModel toDoModel) {
        assert toDoModel != null;
        if (Boolean.parseBoolean(Optional.ofNullable(System.getenv("STOP_SERVICE")).orElse("false"))) {
            return false;
        }
        int result = toDoDao.save(toDoModel);
        switch (result) {
	        case 1:
	            return true;
	        default:
	            return false;
        }
    }

    public void setCurrentNumbering(long numbering) {
        if (numbering > 0) {
            this.currentNumbering = numbering;
        }
    }
}
```

最后，ToDoController 里将调用 ToDoService 方法。

```Java
public class ToDoController {
    public ToDoService toDoService;

    public String add(ToDoModel toDoModel) {
        if (toDoModel == null) {
            return "ERROR";
        } else {
            boolean added;
            try {
                added = toDoService.save(toDoModel);
            } catch (Exception e) {
                return "ERROR";
            }

            if (added) {
                toDoService.setCurrentNumbering(toDoModel.getNumbering());
                return "OK";
            } else {
                return "NOT OK";
            }
        }
    }
}
```

当前，我们已经有了一些逻辑代码，下面我们分别使用 `Mockito` 以及 `JMockit` 来对他们进行一个 Mock 测试。

# 测试设置

## Mockito
创建和使用 mock，最简单方法是使用 `@Mock` 和 `@InjectMocks` 注解。`@Mock` 为用于定义字段的类创建一个 mock，`@InjectMocks` 会把创建的 mock 注入到当前带注释的 mock 中。

还有更多的一些注释，比如 `@Spy`，它可以创建部分 mock（一种在非 mock 的方法中使用正常的实现的 mock）。

为了让我们的 mock 生效，我们还需要在执行测试方法前调用 `MockitoAnnotations.initMocks(this)`，因为这些对于所有的测试用例都需要执行，因此我们一般把它放到 `@Before` 注解的方法中。

```Java
public class ToDoControllerTest {

    @Mock
    private ToDoDao toDoDao;

    @Spy
    @InjectMocks
    private ToDoService spiedToDoService;

    @Mock
    private ToDoService toDoService;

    @InjectMocks
    private ToDoController toDoController;

    @Before
    public void setUp() {
        toDoController = new ToDoController();
        MockitoAnnotations.initMocks(this);
    }
}
```

## JMockit
`JMockit` 的设置方法和 `Mockito` 一样简单，只是没有针对部分 mock 的特定注解（实际上也不需要），还有，在我们运行`Jmockit`前我们需要在 Maven 的 `maven-surefire-plugin`插件（Maven里执行测试用例的插件）里添加一条 javaagent 配置。

```xml
<plugins>
   <plugin>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>2.22.2</version> <!-- or some other version -->
      <configuration>
         <argLine>
            -javaagent:"${settings.localRepository}"/org/jmockit/jmockit/${jmockit.version}/jmockit-${jmockit.version}.jar
         </argLine>
      </configuration>
   </plugin>
</plugins>
```

使用 `@Injectable` 注解可以创建一个 mock 实例。`@Mocked`注解可以为该类的每个实例创建 mock。

使用 `@Tested` 注解创建测试实例，并且自动注入 mock 的依赖项。

```Java
public class ToDoControllerTestWithJMockit {

    @Injectable
    private ToDoDao toDoDao;

    @Injectable
    private ToDoService toDoService;

    @Tested
    private ToDoController toDoController;
}
```

# 验证没有调用 Mock

## Mockito
为了验证我们的 mock 在 `Mockito` 中没有得到调用，我们需要使用 `verifyNoInteractions` 方法，它接受一个 mock 参数。

```Java
@Test
public void should_no_method_has_been_called_when_model_is_null() {
    toDoController.add(null);
    Mockito.verifyNoInteractions(toDoService);
}
```

## JMockit
为了验证我们的 mock 在 `JMockit` 中没有得到调用，我们只需要不指定对该 mock 的期望并执行 `FullVerifications(mock)`。

```Java
@Test
public void should_no_method_has_been_called_when_model_is_null() {
    toDoController.add(null);
    new FullVerifications(toDoService) {};
}
```

# 定义 mock 方法调用及验证对 mock 的调用

## Mockito

为了模拟方法调用，我们可以使用 `Mockito.when(mock.method(args)).thenReturn(value)`。我们可以为多个调用返回不同的值，只需要在最终的返回结果中添加更多的参数：`thenReturn(value1, value2, ..., value-n)`。

为了验证对 mock 的调用，我们可以使用`Mockito.verify(mock).method(args)`，我们还可以使用`verifyNoMoreInteractions(mock)`验证对 mock 没有调用过。

为了验证参数，我们可以使用特定值或者使用预定义的匹配器，比如 `any(), anyString(), anyInt()`等。`Mockito`中有很多这种类似的匹配器，我们甚至还可以自定义。

```Java
@Test
public void should_two_methods_have_been_called() {
    ToDoModel toDoModel = new ToDoModel();
    toDoModel.setNumbering(888L);
    Mockito.when(toDoService.save(toDoModel)).thenReturn(true);

    String result = toDoController.add(toDoModel);

    Assert.assertEquals("OK", result);
    Mockito.verify(toDoService).save(toDoModel);
    Mockito.verify(toDoService).setCurrentNumbering(888L);
}

@Test
public void should_only_one_method_has_been_called() {
    ToDoModel toDoModel = new ToDoModel();
    toDoModel.setNumbering(888L);
    Mockito.when(toDoService.save(toDoModel)).thenReturn(false);

    String result = toDoController.add(toDoModel);

    Assert.assertEquals("NOT OK", result);
    Mockito.verify(toDoService).save(toDoModel);
    Mockito.verifyNoMoreInteractions(toDoService);
}
```

## Jmockit

对于 `Jmockit`，我们需要使用三步：记录，回放和验证。

记录需要在一个新的 `Expectations` 中指定；回放需要调用测试类的方法来完成；验证需要在一个新的 `Verifications`中完成。

对于 mock 方法的调用，我们可以在 `Expectations` 块中使用 `mock.method(args);result = value;`完成，如果我们需要对多个调用返回不同的值，我们可以使用 `return value1, value2, ..., value-n` 代替 `result = value`。

为了验证 mock 方法的调用，我们可以使用一个新的 `Verificatations{mock.call(value)}` 代码块完成，或者我们可以直接使用 `Verificatations{mock}`来完成对我们之前定义的所有方法的验证。

为了验证参数，我们可以使用特定的值，或者我们前面预定义的值，比如：`any, anyString, anyLong` 或其他更多的类似的值。

```Java
@Test
public void should_two_methods_have_been_called() {
    ToDoModel toDoModel = new ToDoModel();
    toDoModel.setNumbering(888L);
    new Expectations() {{
        toDoService.save(toDoModel); result = true;
        toDoService.setCurrentNumbering(888L);
    }};

    String login = toDoController.add(toDoModel);

    Assert.assertEquals("OK", login);
    new FullVerifications(toDoService) {};
}

@Test
public void should_only_one_method_has_been_called() {
    ToDoModel toDoModel = new ToDoModel();
    toDoModel.setNumbering(888L);
    new Expectations() {{
        toDoService.save(toDoModel); result = false;
        // no expectation for setCurrentNumbering
    }};

    String login = toDoController.add(toDoModel);

    Assert.assertEquals("NOT OK", login);
    new FullVerifications(toDoService) {};
}  
```

# mock 异常抛出

## Mockito

我们可以在 `Mockito.when(mock.method(args))`后面使用 `.thenThrow(Exception.class)` 来模拟异常的抛出。

```Java
@Test
public void should_return_error_when_throw_exception() {
    ToDoModel toDoModel = new ToDoModel();
    Mockito.when(toDoService.save(toDoModel)).thenThrow(IllegalArgumentException.class);

    String result = toDoController.add(toDoModel);

    Assert.assertEquals("ERROR", result);
    Mockito.verify(toDoService).save(toDoModel);
    Mockito.verifyNoMoreInteractions(toDoService);
}
```

## JMockit

使用 `JMockit` 模拟异常抛出非常简单，我们只需要返回一个 Exception 作为 mock 方法调用的返回来替代正常返回值即可。

```Java
@Test
public void should_return_error_when_throw_exception() {
    ToDoModel toDoModel = new ToDoModel();
    new Expectations() {{
        toDoService.save(toDoModel);
        result = new IllegalArgumentException();
        // no expectation for setCurrentNumbering
    }};

    String result = toDoController.add(toDoModel);

    Assert.assertEquals("ERROR", result);
    new FullVerifications(toDoService) {};
}
```

# mock 方法调用中传递的参数对象

## Mockito
我们可以创建一个 mock 来作为方法调用的参数。

```Java
@Test
public void should_mock_return_specify_value() {
    ToDoModel toDoModel = Mockito.when(Mockito.mock(ToDoModel.class).getNumbering()).thenReturn(666L).getMock();
    Mockito.when(toDoService.save(toDoModel)).thenReturn(true);

    String result = toDoController.add(toDoModel);

    Assert.assertEquals("OK", result);
    Mockito.verify(toDoService).save(toDoModel);
    Mockito.verify(toDoService).setCurrentNumbering(666L);
}
```

## JMockito
在 `JMockito`中，想要为单独一个方法 mock 一个对象，我们可以把该 mock 对象作为参数传递给测试方法。然后，我们可以使用像其他任何 mock 一样的方式进行后续操作。

```Java
@Test
public void should_mock_return_specify_value(@Mocked ToDoModel toDoModel) {
    new Expectations() {{
        toDoModel.getNumbering(); result = 888L;
        toDoService.save(toDoModel); result = true;
        toDoService.setCurrentNumbering(888L);
    }};

    String result = toDoController.add(toDoModel);
    Assert.assertEquals("OK", result);
    new FullVerifications(toDoService) {};
    new FullVerifications(toDoModel) {};
}
```

# mock 静态方法

## Mockito
遗憾的是，Mockito 自己无法 mock 静态方法，如果我们想使用 Mockito mock 静态方法，需要配合 `PowerMock` 框架一起使用。

## JMockit
使用 JMockit mock 静态方法，需要使用 `MockUp` 方法，在 `MockUp` 方法的泛型中传入需要 Mock 的类，然后使用 `@Mock` 注解重写它的静态方法，以返回我们期望的值。

```Java
@Test
public void should_return_false_when_STOP_SERVICE() {
    ToDoModel toDoModel = new ToDoModel();
    new MockUp<System>(System.class) {
        @Mock
        public String getenv(String param) {
            if ("STOP_SERVICE".equals(param)) {
                return "true";
            }
            return null;
        }
    };
    boolean result = toDoService.save(toDoModel);
    Assert.assertFalse(result);
}
```

# 总结
在本篇文章中，我们分别对 `Mockito` 以及 `JMockit` 的使用做了说明，它们各有优劣。`JMockito` 对于不同类型的测试，它的模式基本一致，因此比较易用。但是因为 `Mockito` 是 Java 社区使用最广泛的 mock 框架，且 `Spring Test` 默认集成并支持 `Mockito`，建议我们直接使用 `Mockito`。

---
> **标题**：[Java Mock 哪家强？Mocktio VS JMockit](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2021-05-22
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。