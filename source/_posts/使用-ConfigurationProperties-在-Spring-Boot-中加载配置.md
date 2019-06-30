---
title: 使用 @ConfigurationProperties 在 Spring Boot 中加载配置
date: 2019-06-30 18:50:57

category:
- Spring Boot
- Java
tags:
- Spring Boot
- Java
---
使用 Spring Boot 加载配置文件的配置非常便利，我们只需要使用一些注解配置一下就能很方便地加载配置项了。今天我们谈一谈 `ConfigurationProperties` 注解的使用，`ConfigurationProperties`可以把配置文件中有相同前缀的配置在一个配置类中直接省去相同前缀进行读取，甚至还可以将相同前缀的配置自动封装成实体类。

## 步骤

### 创建标准 Spring Boot 工程
首先，我们使用一个标准的 Spring Boot 的依赖设置，在 `build.gradle`文件的`plugins`以及`dependencies`中加入相关内容，如下：

```
plugins {
    id 'org.springframework.boot' version '2.1.6.RELEASE'
    id 'java'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

然后创建 Spring application 类，用于启动我们的 Spring Boot 应用。（如果使用 IDEA 进行开发，使用 `New Project` -> `Spring Initializa` 创建 `Spring Boot` 应用非常方便，IDEA 会帮我们自动生成 Spring application 类。）我们顺便在Spring Application 类中加上一个 component，方便我们进行测试。(实现了`CommandLineRunner`的 component 会在应用启动成功后运行)

```
@SpringBootApplication
public class ConfigurationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigurationApplication.class, args);
    }


    @Component
    class StartupRunner implements CommandLineRunner {

        @Override
        public void run(String... args) throws Exception {
            System.out.println("Application running");
        }
    }
}
```

### 编写配置文件
Spring Boot 中默认的配置文件是 `application.properties`，但是我们通常会将自定义的配置单独放在一个文件中，这里我们在 resources 目录下创建一个配置文件 `configprops.properties`，并加入以下配置内容：

```
user.name=Tryking
user.password=Security
user.age=18
```
可以看到，三个配置都有相同的前缀 `user`。

### 编写配置读取类
接下来我们编写一个配置读取的类文件

```
@Configuration
@PropertySource("classpath:configprops.properties")
@ConfigurationProperties(prefix = "user")
public class ConfigProperties {
    private String name;
    private String password;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
    
    @Override
    public String toString() {
        ...
    }
}
```

`Configuration` 注解表明我们需要一个配置 Bean，Spring 启动的时候会在应用 Context 中帮我们创建一个 Java Bean。这里使用 `Component` 也是可以的，但是为了代码的可读性，我们使用 `Configuration` 更合理。

`PropertySource` 注解用来定义我们的配置文件位置，如果没有此注解的话，Spring Boot 默认找的是 `application.properties` 文件。

`ConfigurationProperties` 注解便是我们的主角了，它用来定义我们要加载的配置的前缀，我们这里定义的是 `user`，因此 Spring Boot 会去寻找 user 前缀的配置。

在此类中，我们定义了三个属性，分别是 `name`, `password`, `age`，和我们配置文件中的属性是一一对应的。因为 Spring 使用标准的 Java Bean Setters，因此我们需要实现各个属性的 `getter` & `setter` 方法。

这样我们就完成了所有的配置，Spring 会自动将我们在配置文件中含有 `user` 前缀的配置绑定到 `ConfigProperties` 类中具有相同名字的属性上。

### 测试配置成功与否

然后我们在 `ConfigurationApplication` 启动类中定义的 `StartupRunner` component 中增加对此配置文件的测试，我们使用此配置的 `toString()` 方法进行输出。

```
private final ConfigProperties configProperties;

// 引入配置 bean
@Autowired
public ConfigurationApplication(ConfigProperties configProperties) {
    this.configProperties = configProperties;
}

public static void main(String[] args) {
    SpringApplication.run(ConfigurationApplication.class, args);
}

@Component
class StartupRunner implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Application running");
        // 输出
        System.out.println(configProperties.toString());
    }
}
```

最后，我们启动 Application，可以看到命令行中成功输出了我们的配置信息。

```
Application running
ConfigProperties{name='Tryking', password='Security', age=18}
```

## 进阶：加载嵌套属性
我们还可以使用 `ConfigurationProperties` 来实现复杂对象的属性加载，比如 Map，List，以及实体类。

我们在配置文件中继续增加更多的配置：

```
# Simple properties
user.name=Tryking
user.password=Security
user.age=18

# List properties
user.friends[0]=Tom
user.friends[1]=Jack

# Map properties
user.scores.java=90
user.scores.python=95

# Object properties
=Beijing
user.job.salary=50000
```

然后在配置读取类中增加对这些属性的读取。

```
private String name;
private String password;
private int age;
private List<String> friends;
private Map<String, Integer> scores;
private Job job;

...set...
```
同时不要忘记 `getter` & `setter` 方法的实现，以及实体 Bean `Job`的定义（同样需要实现 `getter` & `setter` 方法）。

完成后，我们重新运行 Application，可以看到这些复杂配置也成功读取出来了：

```
Application running
ConfigProperties{name='Tryking', password='Security', age=18, friends=[Tom, Jack], scores={java=90, python=95}, job=Job{address='Beijing', salary=50000}}
```

## 进阶：在 @Bean 上使用 @ConfigurationProperties

我们还可以在具有 @Bean 注解的方法上使用 @ConfigurationProperties。

当我们想在我们引用的外部第三方 component 中绑定一些属性时，此方法特别有用。

我们先创建一个简单的 Item 供后面的类引用。

```
public class Item {
    private String name;
    private int size;
 
    // standard getters and setters
}
```

接下来，我们在 @Bean 注解上使用 @ConfigurationProperties，以绑定我们配置的属性到此 Bean 上。

```
@Configuration
public class ConfigProperties {
 
    @Bean
    @ConfigurationProperties(prefix = "item")
    public Item item() {
        return new Item();
    }
}
```

这样，Spring Context 会将所有带有 item 前缀的属性帮我们映射到 Item 实例中。

## 配置验证
@ConfigurationProperties 提供了属性验证的功能，使用 `JSR-303` 格式来进行验证。支持验证需要在类上增加`@Validated`注解，然后我们可以进行如下验证：

* hostName 不允许为空

	```
	@NotBlank
	private String hostName;
	```

* authMethod 属性的长度为 1 - 3 个字符

	```
	@Length(max = 4, min = 1)
	private String authMethod;
	```
	
* port 属性的取值从 1025 到 65536

	```
	@Min(1025)
	@Max(65536)
	private int port;
	```
* from 属性必须满足 Email 格式

	```
	@Pattern(regexp = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,6}$")
	private String from;
	```
通过这种方式我们就可以验证属性是否合规，而不用使用一系列的 `if 、else` 来进行验证了。

如果有验证无法通过，那么我们启动应用的时候 Application 将启动失败，并且抛出一个`IllegalStateException`异常。













