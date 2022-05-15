---
title: Java 单元测试指北
toc: true
tags:
  - 测试
category:
  - 测试
date: 2021-05-14 21:35:38
thumbnail:
---

每个程序员在修改代码的时候都希望有测试，而在写代码时，都不想写测试。
<!--more-->
# 为什么要写单元测试
首先，只有经过测试的代码，代码质量才会更高。其次，如今早已不是单打独斗的时代，团队中的服务不是你自己一个人在维护，如果你不写测试，别人（可能包括未来的自己）修改你的代码时，可能会影响你的原有逻辑。如果你的代码经过单元测试保证后，别人修改了，测试用例跑不过，他就会进一步检查自己的修改是否正确。因此，编写测试相当于为代码加了一层防护网。

可能有些人会说，我只是开发，测试的工作应该交给测试同学，这其实是一种极其不负责任的表现。开发和测试，对一个系统的视角是不同的，开发对于一个系统的出发点是实现，测试对于一个系统的出发点是业务。测试同学并不会关心你的代码如何实现，他们测试系统时相当于是黑盒测试，作为覆盖，我们还需要自己编写代码的测试进行白盒测试。

单元测试是所有的测试里面最基础、最底层的测试。因为它针对代码中的“方法”，因此它的运行速度比较快，可以尽早发现问题。只有通过单元测试保证了每个组件的正确性，我们才能保证最终系统的稳定性。

# 单元测试的结构

`Junit` 是 `Java` 最常用的测试框架，下面我们使用 `Junit` 来写一个最基础的测试用例来看下它的结构。

```Java
// 业务类
public class CalcService {
    public int plus(int first, int second) {
        return first + second;
    }
}

// 测试类
public class CalcServiceTest {
	@Test
	public void should_plus_two_numbers() {
		// 准备 
   	 	CalcService calcService = new CalcService();
   	 	// 执行
   		int plus = calcService.plus(1, 2);
   		// 断言
   	 	assertEquals("The result should be", 3, plus);
   	 	// 清理
	}
}
```

* 在上面的测试中，我们用 `@Test` 来标识测试用例，`Junit`用这个注解来进行识别。
* 我们定义了一个 `public` 方法，对于 `Junit5`，`public` 可以省略。
* 我们将测试方法命名为了`should_plus_two_numbers`，即 `should_测试场景`。这是常用的一种命名方式，还有一种是 `shoule_测试效果_while_条件`。后面这种一般针对反例，即在什么情况下应该是怎样的测试效果。
* 准备：此阶段为测试做准备，比如 `mock` 一些外部依赖，初始化我们要测试的类、数据等。
* 执行：这是测试的核心阶段，用于触发被测试目标的行为，一般为执行一个方法的调用。
* 断言：负责验证我们的预期。在这个例子中，我们期望函数返回的结果为 `3`。
* 清理：用于清理我们在准备阶段做的一些操作，大部分情况下这步是不必要的。但是假如我们有一些改变外部环境的操作，这需要将其复原，比如我们的测试需要创建文件等，则需要在测试完成后将其清理。

另外，假如我们的准备和清理阶段是许多测试方法共用的，我们可以将其移入 `setUp` 和 `tearDown` 方法中，从字面意思我们可以知道他们的作用是 `装载`和`拆除`。示例如下：

```
// 每个测试方法执行前都会被执行
@BeforeEach
void setUp() {
}

// 每个测试方法执行后都会被执行
@AfterEach
void tearDown() {
}

// 一个测试类开始执行测试方法前会被执行，只执行一次
@BeforeAll
static void beforeAll() {
}

// 一个测试类执行完所有的测试方法后会被执行，只执行一次
@AfterAll
static void afterAll() {
}
```

# Mock 框架
在我们的代码中，我们往往会有很多外部依赖，这些外部依赖只有在我们的服务真正跑到服务器上才有可能给我们正常的预期结果，但是我们的单元测试是需要在部署到服务器前验证我们的代码功能的，那怎么才能让我们的单元测试正常工作呢？比如，我们依赖某些外部接口，但是我们本地开发环境并没有外部接口的访问能力（网络等原因）。这时，我们需要使用 `mock` 技术，我们假设外部依赖是可靠的，并且模拟外部依赖的返回，让我们的单元测试测试的时候不真正依赖这些外部依赖。

`Mock` 框架的基本逻辑比较简单，它做的工作主要是创建一个模拟对象，并且模拟它的返回。`Mockito`是 `Java 社区`最常用的 `Mock` 框架，下面我们来看看如何使用 `Mockito` 来 `Mock`对象。

```
// 业务方法
public int getLuckNumber(int original) {
    int special = 8;
    RemoteService remoteService = new RemoteService();
    int remoteLuckyNumber = remoteService.getRemoteLuckyNumber(original);
    return special + remoteLuckyNumber;
}

// 测试方法
@Test
void should_plus_original_number_with_special() {
    CalcService calcService = new CalcService();
    RemoteService mock = mock(RemoteService.class);
    when(mock.getRemoteLuckyNumber(anyInt())).thenReturn(8);
    int target = calcService.getLuckNumber(1);
    assertEquals("The result should be", 16, target);
    verify(mock, atLeast(1)).getRemoteLuckyNumber(anyInt());
}
```
在上面的业务方法中，我们通过 `RemoteService` 调用远程接口获取一个数字的幸运码，但是这种外部依赖我们无法确定其的真实返回，如果我们需要测试我们自己的 `getLuckNumber`方法，我们就需要 `Mock` 这个外部依赖的实现了。在测试方法中，我们先使用 `mock` 方法 `mock` 了一个 `RemoteService`类，并且我们让`getRemoteLuckyNumber` 这个方法无论传递什么值时都返回了 8。这样当我们调用自己的 `getLuckNumber` 方法时，我们就能确定它的返回值，进而对其进行单元测试了。

# 测试覆盖率
测试覆盖率是一种度量指标，它表示在运行一个测试集合时，代码中有多少被执行的比例。常见的测试覆盖率指标有：

* 行覆盖率：代码中有多少行被测试过。
* 函数覆盖率：代码中有多少函数被测试调用过。
* 分支覆盖率：控制语句中的分支有多少经过测试。（if/switch等）
* 条件覆盖率：每个布尔表达式的子表达式是否都经过不同情况的检查。

## JaCoCo
在 Java 社区里，`JaCoCo`是一个最常用的测试覆盖率工具，它可以和`Maven`，`Gradle`等进行集成使用。下面我们看下如何使用 `Maven` 集成。

首先，加入 `JaCoCo` 的  `Maven` 依赖。

```xml
<dependency>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
</dependency>
```

其次，加入 `JaCoCo` 的 `Maven` 插件。

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <configuration>
        <includes>
            <include>com/**/*</include>
        </includes>
    </configuration>
    <executions>
        <execution>
            <id>pre-test</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>post-test</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

做完这两步后，基本的配置就完成了。这时，我们只需要执行 `mvn test`，我们的测试覆盖率报告就能生成了。
打开 `target` 目录下的 `site/jacoco/index.html`，可以看到我们的代码测试覆盖率报告。

![](https://cdn.jsdelivr.net/gh/Tryking/images/common/20220515143031.png)

---
> **标题**：[Java 单元测试指北](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[Java 单元测试指北](https://dengkaiting.com/)
> **时间**：2021-05-14
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。