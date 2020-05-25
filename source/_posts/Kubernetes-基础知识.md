---
title: Kubernetes - 基础知识
toc: true
date: 2020-03-15 11:03:26
tags:
- Kubernetes
- Docker

category:
-

thumbnail:
---

你知道如何创建一个 `Kubernetes` 集群吗？

<!--more-->
# 创建一个 Kubernetes 集群
## 创建一个集群

首先我们需要安装 minikube

使用命令 `minikube version`，检查 `minikube` 是否安装成功。

然后我们可以使用命令 `minikube start` 启动 `minikube`。

等待 `minikube` 启动后，一个 `Kubernetes` 集群就已经运行起来了。

## 集群版本

为了和 `Kubernetes` 进行交互，我们需要使用 `kubectl` 命令行。为了检测 `kubectl` 是否已经成功安装，我们可以使用命令 `kubectl version`.

```bash
$ kubectl version
Client Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.3", GitCommit:"06ad960bfd03b39c8310aaf92d1e7c12ce618213", GitTreeState:"clean", BuildDate:"2020-02-11T18:14:22Z", GoVersion:"go1.13.6", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.3", GitCommit:"06ad960bfd03b39c8310aaf92d1e7c12ce618213", GitTreeState:"clean", BuildDate:"2020-02-11T18:07:13Z", GoVersion:"go1.13.6", Compiler:"gc", Platform:"linux/amd64"}
```

根据上面的信息，我们可以看到 `kubectl` 已经配置成功了。 其中 `Client version` 指的是 `kubectl` 的版本，`Server version` 指的是安装在 master 节点的 `Kubernetes` 的版本。

## 查看集群详情

我们还可以查看集群的详情。

`kubectl cluster-info` 查看集群的详情。

`kubectl get nodes` 这个命令展示了可以用于托管我们应用程序的所有节点。


# 部署一个 APP 应用

一个 Pod 是 Kubernetes 应用中一个基本的执行单元。每个 Pod 都代表运行在你的集群中工作负载的一部分。

## 部署我们的 APP 应用

Kubernetes 部署 APP 的命令是 `kubectl create deployment`。我们需要提供部署的名字和 APP 的镜像位置（包含镜像在外部 Docker hub 仓库的全路径），例如：

`kubectl create deployment kubernetes-bootcamp --image=gcr.io/google-samples/kubernetes-bootcamp:v1`

部署完后，我们可以使用以下命令获取我们所有已经部署过的 APP。

`kubectl get deployments`


## 查看我们的 APP 应用

运行在 Kubernetes 内部的 Pods 相当于运行在一个私有的、独立的网络中。默认情况下，各个 Pod 之间以及在相同 Kubernetes 集群中的服务是可见的，但是对于外部网络不可见。我们使用 `kubectl`的命令可以通过 API endpoint 来和我们的应用进行交互。

后面我们会学习如何暴露应用给外部的 Kubernetes 集群。

`kubectl proxy` 命令可以创建一个代理，这将可以把通信转发到集群内的私有网络。当按下 `Control+C` 时，代理可以被终端。当代理工作的时候，界面不会有任何输出。

创建好代理后，我们就可以直接访问我们刚刚部署的应用服务了。

# 探索应用

当我们创建一个应用部署时，`Kubernetes` 会创建一个 `Pod` 来管理应用实例。`Pod` 是 `Kubernates` 用来表示拥有一个或多个应用实例容器（比如 `docker` 或者 `rkt`）的一个组的概念，这些容器之间共享资源。这些资源包括：

* 共享存储，作为存储卷
* 网络，作为一个独立的集群 IP 地址
* 有关如何运行每个容器的信息，比如容器镜像版本或者要使用特定的端口

`Pod` 为特定于应用程序的 “逻辑主机” 建模，并且可以包含相对紧密耦合的不同应用程序容器。例如，一个 `Pod` 可能同时包含带有 Node.js 应用程序的容器以及一个不同的容器，该容器将提供要有 Node.js Web 服务器发布的数据。 `Pod` 中的容器之间共享一个 IP 地址和端口空间，它们始终位于同一位置并共同调度，并运行在同一节点的共享上线文中。

`Pod` 是 `Kubernetes` 平台上的原子单元。当我们在 `Kubernetes` 上创建一个部署时，部署会创建包含一些容器的一个 `Pod`（与直接创建容器相对立）。每个 `Pod` 都绑定到计划的节点上，并保持在那里，直到终止（根据重新启动策略）或删除为止。如果节点发生故障，`Kubernetes`会在集群中其他可用节点上调度相同的 `Pod`。

## Nodes

`Pod` 始终运行在 `Node` 上。`Node` 是 `Kubernetes` 中的工作机，可以是虚拟机或者物理机，这具体取决于集群。每个 `Node`由主 `Node` 管理。一个 `Node` 可以有多个 `Pod`， `Kubernetes` 中的 Master 会自动处理跨集群中所有 `Node` 调度 `Pod` 的过程。`Master` 的自动调节会考虑每个 `Node` 上的可用资源。

每个 `Kubernetes` `Node` 至少会运行：

* `Kubelet`， 一个负责 `Kubernetes` `Master` 与 `Node` 之间通信的组件；它会管理 `Pod` 和在机器上运行的容器。
* 容器运行时（比如 `Docker`, `rkt`）。它负责从注册表中提取容器镜像，解压缩容器并运行应用程序。

![](https://d33wubrfki0l68.cloudfront.net/5cb72d407cbe2755e581b6de757e0d81760d5b86/a9df9/docs/tutorials/kubernetes-basics/public/images/module_03_nodes.svg)

## 使用 `Kubectl` 进行故障排查
常用的 `Kubectl` 命令有：

* `kubectl get` 列出资源
* `kubectl describe` 显示有关资源的详细信息
* `kubectl log` 从容器中的容器中打印日志
* `kubectl exec` 在容器中的容器上执行命令

我们可以使用这些命令来查看应用程序的部署时间，它们的当前状态，运行的位置以及它们的配置。

# 使用服务公开应用

## Kubernetes 服务概述

`Kubernetes` 中的 `Pods` 是会死亡的。实际上 `Pods` 是有生命周期的。当一个工作 Node 死亡了，运行在其上的 `Pods`就跟着丢失了。然后 `ReplicaSet` 可能会通过创建新的 `Pods` 来动态地将集群驱动回所需的状态，以保持应用程序正常运行。现在，假设有一个具有3个副本的图像处理后端，这些副本是可以交换的。但是对于前段系统来说，我们不应该关心后端的副本，即使 Pod 丢失并重新创建。也就是说，Kubernetes 集群中的每个 Pod 都有一个唯一的 IP 地址，即使是同一个节点上的 Pod 也是一样，因此我们需要一种自动协调 Pod 之前的方法，以便应用程序能持续运行。

Kubernetes 中的服务是一种抽象，它定义了 Pod 的逻辑集合和访问 Pod 的策略。服务使从属 Pod 之间的松耦合成为可能。像所有 Kubernetes 对象一样，使用 YAML 或 JSON 定义服务。服务所针对的 Pod 集合通常由 LabelSelector 决定。

尽管每个 Pod 都有一个唯一的 IP 地址，但是如果没有 Service，这些 IP 不会暴露在集群外部。Service 允许应用程序接收流量。通过 `type` 在 `ServiceSpec` 中指定可以以不同的方式公开服务：

* ClusterIP（默认）- 在群集的内部 IP 上公开服务，这种类型使得只能从群集内访问服务。
* NodePort - 使用 NAT 在群集中每个选定节点的相同端口上公开服务。使得可以使用 `<NodeIP>:<NodePort>`从群集外部访问服务。它是 ClusterIP的超集。
* LoadBalancer - 在当前云中创建一个外部负载平衡器（如果支持），并为该服务分配一个固定的外部 IP。它是 NodePort 的超集。
* ExternalName - `externalName` 通过返回具有该名称的 CNAME 记录，使用任意名称（在规定范围中指定）公开服务。它不使用代理，这种类型需要 v1.7 以上的 `kube-dns`。

## Services 和 Labels

`Service` 在一组 `Pod` 之前路由流量。`Service` 是允许 `Pod` 在 `Kubernetes` 中死亡和复制交叉而又不影响应用程序的一个概念。`Kubernetes Services` 处理在依赖 `Pod` （例如应用程序中的前端和后端组件）之间的发现和路由。

`Service`通过 `labels` 和 `selectors`来匹配一组 `Pods`，这是一组原语，其允许对 Kubernetes 中的对象进行逻辑操作。`labels` 是附加在对象上的键值对，可以多种方式使用：

* 指定用于开发，测试和生产环境的对象
* 嵌入版本标签
* 使用 label 对对象进行分类

`labels` 可以在创建时或者创建完成后附加到对象，并且可以随时对它们进行修改。

# 运行应用程序的多个实例

## 扩缩（Scaling）应用程序

在之前的模块中，我们创建了一个 Deployment，然后通过 Service 让其可以公开访问。Deployment 仅为跑这个应用程序创建了一个 Pod。当流量增加时，我们需要扩容应用程序以满足用户需求。

扩缩（Scaling）是通过改变 Deployment 中的副本数量来实现的。

在运行 `kubectl run` 命令时，可以通过设置 --replicas 参数来设置 Deploy 的副本数量。

## 扩缩概述

扩缩 Deployment 将创建新的 Pods，并将资源调度请求分配到有可用资源的节点上，收缩会将 Pods 的数量减少至所需的状态。 Kubernetes 还支持 Pods 的自动缩放。

运行应用程序的多个实例需要在它们之间分配流量。服务（Service）有一种负载均衡器类型，它可以将网络流量均衡分配到外部可以访问的 Pods 上。Service 将会一直通过端点来监视 Pods 的运行，保证流量只分配到可用的 Pods 上。

# 指定滚动更新

## 更新应用程序

用户希望应用程序始终可用，而开发人员则需要每天多次部署它们的新版本。在 Kubernetes 中，这些可以通过滚动更新（Rolling Updates）来完成。滚动更新允许通过使用新的实例逐步更新 Pod 实例，零停机进行 Deployment 更新。新的 Pod 将在具有可用资源的 Node 上进行调度。

在前面的模块中，我们将应用程序扩展为运行多个实例。这是在不影响应用程序可用性的情况下执行更新的要求。默认情况下，更新期间不可用的 Pod 的最大值和可以创建 Pod 数都是 1 。这两个选项都可以配置为（Pod）数字或百分比。在 Kubernetes 中，更新时经过版本控制的，任何 Deployment 更新都可以恢复到以前的（稳定）版本。
















---
> **标题**：[Kubernetes - 创建一个 Kubernetes 集群](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2020-03-15
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。