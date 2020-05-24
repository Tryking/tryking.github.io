---
title: Kubernetes - 
toc: true
date: 2020-03-15 11:03:26
tags:
- Kubernetes
-

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

# 探索应用，和应用进行交互

## 检查应用配置






























---
> **标题**：[Kubernetes - 创建一个 Kubernetes 集群](https://dengkaiting.com/)
> **作者**：[末日没有进行曲](https://dengkaiting.com/)
> **链接**：[link](https://dengkaiting.com/)
> **时间**：2020-03-15
> **声明**：本博客所有文章均采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议，转载请注明出处。