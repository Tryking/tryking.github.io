---
title: 使用 Docker 构建你的 Spring Boot 程序
toc: true
date: 2019-08-16 06:55:02
tags:
- docker
category:
thumbnail:
---

很多人都使用容器来包装他们的 Spring Boot 应用程序，然而创建容器并不是一件很容易的事情。这篇文章将指导你构建运行 Spring Boot 应用程序的Docker镜像。

<!--more-->

对于我们开发者来说，容器不是一个好理解的概念 -- 它会强迫我们了解并考虑非常低级的问题 -- 但是有些时候我们需要创建或使用容器，因此我们理解下构建块的内容是有必要的。

在这篇文章中，我会向你展示创建容器的一些知识，你可以针对你的应用程序作出适当地选择。

Docker 是一个具有“社交”方面的 Linux 容器管理工具，它允许用户发布容器镜像，以及使用其他人发布的镜像。Docker 镜像是一个运行容器化进程的“食谱”，接下来，我将构建一个简单的 Spring Boot 应用程序的镜像。

在此之前，你需要安装一下 Docker。（[Docker](https://docs.docker.com/installation/#installation)）如果你使用的系统是 Windows，你需要安装 Docker Desktop。（[Docker Desktop](https://www.docker.com/products/docker-desktop)）

## 创建 Gradle 工程
首先，我们使用 IDEA 创建一个 Gradle 工程。然后，在 `build.gradle` 文件中加入以下内容：

```groovy
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("org.springframework.boot:spring-boot-gradle-plugin:2.1.6.RELEASE")
    }
}

apply plugin: 'java'
apply plugin: 'org.springframework.boot'
apply plugin: 'io.spring.dependency-management'

bootJar {
    baseName = 'spring-boot-docker'
    version =  '0.1.0'
}

repositories {
    mavenCentral()
}

sourceCompatibility = 1.8
targetCompatibility = 1.8

dependencies {
    compile("org.springframework.boot:spring-boot-starter-web")
    testCompile("org.springframework.boot:spring-boot-starter-test")
}
``` 
在 Gradle 构建文件中，我们使用了 [Spring Boot Gradle 插件](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/html/)，它可以提供很多便利的特性：
* 它可以收集环境变量中的所有的 jar，然后将它们构建成一个简单的，可运行的“über-jar”。（über 是一个德文单词，可理解为总）这使得执行和传输服务变得更加方便。
* 它会搜索 `public static void main()` 方法，并将它标记为一个可运行的类。
* 它提供了一个内置的依赖解决工具，可以设置 [Spring Boot 依赖](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-project/spring-boot-dependencies/pom.xml)的版本号。你可以用你想要的版本进行覆盖，但是它默认为 Spring Boot 选择的版本。

## 创建 Spring Boot 应用

我们在工程中创建一个 `Application` 类，作为 Spring Boot 的启动类，同时也作为一个 Controller 类。

```java Application.java
@SpringBootApplication
@RestController
public class Application {
    @RequestMapping("/")
    public String home() {
        return "Hello Docker World";
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

现在我们可以运行一下 Spring Boot 程序，可以直接在 IDEA 中运行，也可以使用以下命令运行 `./gradlew build && java -jar build/libs/spring-boot-docker-0.1.0.jar`。（Windows：`gradlew build && java -jar build/libs/spring-boot-docker-0.1.0.jar`）

运行成功后，我们访问 [localhost:8080](localhost:8080)，可以看到页面会显示“Hello Docker World”。

## 制作 Docker 镜像
我们在上面的 Gradle 构建文件中有一个任务 `bootJar`，此任务会在 `build/libs` 下生成可运行的 jar 包 `spring-boot-docker-0.1.1.jar`。接下来我们使用此 jar 文件制作一个 Docker 镜像。

首先，我们编写 Dockerfile。

```dockerfile
FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG JAR_FILE
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

这个 Dockerfile 非常简单，但是你需要运行一个没有多余装饰的 Spring Boot 项目：仅仅使用 Java 和 一个 JAR 文件。项目的 JAR 文件作为 “app.jar” 被添加进容器，然后在 `ENTRYPOINT` 中执行。

然后我们运行 docker 命令制作 docker 镜像： `docker build --build-arg JAR_FILE=build/libs/*.jar -t myorg/myapp .`

如果运行失败，并且日志显示如下：

```log
...... This error may also indicate that the docker daemon is not running.
```
说明我们的机器没有启动 Docker，需要把 Docker 启动后再运行，在 Windows 上运行的是 Docker Desktop。

制作镜像成功后，我们可以运行命令查看当前我们的 Docker 中的镜像：`docker images`，显示如下：

```log
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
myorg/myapp         latest              4979c9dc93c3        About a minute ago   122MB
openjdk             8-jdk-alpine        a3562aa0b991        3 months ago         105MB
```

可以看到，我们创建的镜像 `myorg/myapp` 已经成功了，然后我们运行此镜像：`docker run -p 8080:8080 myorg/myapp`，显示如下：

```log
$ docker run -p 8080:8080 myorg/myapp

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.1.6.RELEASE)

2019-08-13 09:27:13.796  INFO 1 --- [           main] com.tryking.docker.Application           : Starting Application on fbe1e74d4885 with PID 1 (/app.jar started by root in /)
2019-08-13 09:27:13.800  INFO 1 --- [           main] com.tryking.docker.Application           : No active profile set, falling back to default profiles: default
2019-08-13 09:27:15.276  INFO 1 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2019-08-13 09:27:15.322  INFO 1 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2019-08-13 09:27:15.322  INFO 1 --- [           main] org.apache.catalina.core.StandardEngine  : Starting Servlet engine: [Apache Tomcat/9.0.21]
2019-08-13 09:27:15.433  INFO 1 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2019-08-13 09:27:15.434  INFO 1 --- [           main] o.s.web.context.ContextLoader            : Root WebApplicationContext: initialization completed in 1567 ms
2019-08-13 09:27:15.718  INFO 1 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
2019-08-13 09:27:15.946  INFO 1 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2019-08-13 09:27:15.950  INFO 1 --- [           main] com.tryking.docker.Application           : Started Application in 2.688 seconds (JVM running for 3.309)
2019-08-13 09:27:26.452  INFO 1 --- [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2019-08-13 09:27:26.453  INFO 1 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2019-08-13 09:27:26.458  INFO 1 --- [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 5 ms
```

这里，我们的 Docker 镜像就制作成功了，可以访问 [localhost:8080](localhost:8080) 看一下结果是否正常。

使用命令查看 docker 镜像运行是否正常： `docker ps`

```log
$ docker ps
CONTAINER ID        IMAGE               COMMAND                CREATED             STATUS              PORTS                    NAMES
fbe1e74d4885        myorg/myapp         "java -jar /app.jar"   8 minutes ago       Up 8 minutes        0.0.0.0:8080->8080/tcp   nostalgic_hermann
```

可以看到我们的 docker 正在正常运行，并且已经运行了 8 分钟。

到目前为止，我们的 docker 配置非常简单，生成的镜像也非常低效。Docker 镜像只有一个单独的文件系统层，里面包含了一整个 jar，我们每次更改代码的时候，都会直接更改到这层，这会导致这层占用空间非常大。我们可以改进一下，把这个 JAR 包分成多层。

### 更小的镜像
我们前面采用的基础镜像是 `openjdk:8-jdk-alpine`，`alpine` 镜像比 [Dockerhub](https://hub.docker.com/_/openjdk/) 提供的标准的 `openjdk` 镜像更小。 目前还没有针对 Java 11 的官方 alpine 镜像。你还可以在基础镜像中通过使用 `jre` 标签代替 `jdk`来节省大约 20 MB 的空间。虽然并不是所有的应用使用 JRE 就能工作（相对于 JDK），但是大部分应用都可以。实际上，由于对 JDK 特性滥用的风险存在（比如编译），一些组织会强制执行对于每个 APP 必须遵守的规则。

最后，对于镜像构建有一个非常重要的问题：我们的目标不总是要构建尽可能小的镜像。较小的镜像上传和下载速度比较快，这固然好，但是这也有个前提：它们中的任何层都没有被缓存。镜像注册非常复杂，你可以通过尝试巧妙地使用图像构造来轻松地失去这些功能的好处。如果你使用公共基础层，你根本不需要担心镜像的总大小，并且随着注册和平台的发展，镜像可能会变得更小。话说回来，尝试优化我们应用的镜像的层仍然是非常重要以及有效的，但是我们的目标应该始终是将最快速变化的东西放在最高层，并与其他程序共享尽可能多的大型较低层。

## 优化的 Dockerfile

由于 Spring Boot fat jar 的打包方式，它自然就有多层这个概念。我们解压 jar 包后可以发现，它里面早已分成了外部和内部依赖。要在 docker 构建中执行此操作，我们需要先解压 jar 包。例如：

```bash
$ mkdir build/dependency
$ cd build/dependency/; jar -xf ../libs/*.jar
$ docker build -t myorg/myapp .
```

对应的 Dockerfile 为：

```dockerfile
FROM openjdk:8-jdk-alpine
VOLUME /tmp
ARG DEPENDENCY=build/dependency
COPY ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY ${DEPENDENCY}/META-INF /app/META-INF
COPY ${DEPENDENCY}/BOOT-INF/classes /app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.tryking.docker.Application"]
```

现在我们的 docker 镜像有三层了，后面的两层包含所有的应用程序资源。如果应用的依赖不做更改，那么第一层（来自 `BOOT-INF/lib）将不会变动，因此构建将会非常快，只要基础层已经被缓存过，容器在运行时的启动也是如此。

> 我们使用了硬编码指定应用的启动类 `com.tryking.docker.Application`。在这里我们还可以将 Spring Boot fat `JarLauncher` 复制进镜像，然后使用它来启动应用，这样就不需要指定 main 类了，但是它可能会拖慢速度。

## 微调
如果我们想要让应用启动速度尽可能快，有一些微调我们可以用到。下面是一些方法：

* 使用 [`spring-context-indexer`](https://docs.spring.io/spring/docs/current/spring-framework-reference/core.html#beans-scanning-index)。对于小型程序来说它可能增加不了太多，但是苍蝇再小也是肉。
* 如果可以的话，尽量不要使用执行器 [actuators](https://docs.spring.io/spring-boot/docs/current-SNAPSHOT/reference/htmlsingle/#production-ready)。
* 使用 Spring Boot 2.1 以及 Spring 5.1。
* 使用 `spring.config.location`（命令行参数或系统属性） 代替 [Spring Boot 默认的配置文件地址](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-external-config-application-property-files)。
* 关闭 JMX - 在容器中你可能不需要它。命令：`spring.jmx.enabled=false`
* 使用 `-noverify` 运行 JVM。还要注意： `-XX:TieredStopAtLevel=1` （这个虽然会节约启动时的时间，但是后面会导致 JIT 的速度减慢）
* 对于 Java 8， 使用容器内存提示：`-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap`。在 Java 11 中，这些已经被默认设置了。

我们的应用程序可能运行的时候不需要完整的 CPU，但是它需要多个 CPU 才能尽可能快地启动（至少 2 个，4 个更好）。如果我们不介意启动速度较慢，可以将 CPU 降到 4 个以下。如果我们被迫以少于 4 个 CPU 启动，我们可以设置 `Dspring.backgroundpreinitializer.ignore = true`，因为它会阻止 Spring Boot 创建一个它可能无法使用的新线程。（这个适用于 Spring Boot 2.1.0 及以上版本）

## Docker 构建插件

如果我们在构建中不想直接调用 `docker` 命令，有很多 Gradle 插件可以帮我们做这些，下面介绍一些。

### Palantir Gradle Plugin

[`Palantir Gradle Plugin`](https://github.com/palantir/gradle-docker) 插件和 Dockerfile 一起工作，它也可以为我们生成一个 Dockerfile，然后它会运行 `docker`，就像我们自己在命令行中运行一样。

首先，我们需要在 `build.gralde` 中引入：

```groovy build.gralde
buildscript {
    repositories {
        maven {
            url "https://plugins.gradle.org/m2/"
        }
        mavenCentral()
    }
    dependencies {
        ...
        classpath('gradle.plugin.com.palantir.gradle.docker:gradle-docker:0.13.0')
    }
}
```

最后，我们需要应用此插件然后调用它的任务：

```groovy build.gralde
apply plugin: 'com.palantir.docker'

group = 'myorg'

bootJar {
    baseName = 'myapp'
    version =  '0.1.0'
}

task unpack(type: Copy) {
    dependsOn bootJar
    from(zipTree(tasks.bootJar.outputs.files.singleFile))
    into("build/dependency")
}
docker {
    name "${project.group}/${bootJar.baseName}"
    copySpec.from(tasks.unpack.outputs).into("dependency")
    buildArgs(['DEPENDENCY': "dependency"])
}
```

在此示例中，我们选择在解压 Spring Boot 的 fat jar 到一个 build 目录下的特定位置，这里是 docker 构建的根目录。然后上面的多层（multi-layer，不是 multi-stage） Dockerfile 就会工作了。

### Jib Gradle Plugin

参照 [Jib](https://github.com/GoogleContainerTools/jib)

## 持续集成

自动化现在是（或者应该是）每个应用程序的一部分。人们用来进行自动化的工具往往非常擅长从源代码中调用构建系统。因此，如果有一个 Docker 镜像，并且构建代理中的环境与开发人员的环境一致，这对于我们来说就足够了。对 docker 注册表进行身份验证对我们来说可能是最大的挑战，但是所有的自动化工具中都有一些功能可以帮助我们解决这个问题。

但是，有时我们最好将容器的创建完全留给自动化层，这样可以保证我们的代码不需要被污染。容器创建是一个棘手的问题，我们开发人员往往并不关心它。如果我们的代码更加整洁，那么不同的工具将更有可能做到“做正确的事”，比如应用安全修复，优化缓存等。自动化有很多选择，如今他们都会带一些与容器化相关的功能。接下来我们看一下 `Jenkins`。

### Jenkins

[Jenkins](https://jenkins.io/) 是一个非常流行的自动化服务。它有很多特性，但是最接近其他自动化示例的是它的 [`pipeline`](https://jenkins.io/doc/book/pipeline/docker/) 功能。下面是一个 `Jenkinsfile`，它会使用 maven 构建一个 Spring Boot 工程，然后使用 `Dockerfile` 构建一个镜像并把它们推送到仓库中。

```Jenkinsfile Jenkinsfile
node {
    checkout scm
    sh './mvnw -B -DskipTests clean package'
    docker.build("myorg/myapp").push()
}
```

## 结语

本文提供了很多用于为 Spring Boot 应用构建容器镜像的选项。所有的内容都是有效的选择，现在由你自己决定需要哪个。你的第一个问题应该是“我真的需要建立一个容器镜像吗？”如果答案是确定的，那你的选择可能要尽可能考虑效率和可缓存性等。


---
> **标题**：[{{title}}](https://dengkaiting.com/2019/08/16/使用-Docker-构建你的-Spring-Boot-程序/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/2019/08/16/使用-Docker-构建你的-Spring-Boot-程序/)
> **时间**：2019/08/16
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。