---
title: OpenTelemetry × Elastic Observability 系列（一）： 整体架构介绍
author: Se7en
date: 2025/05/30 10:00
categories:
 - OpenTelemetry
 - Elastic
tags:
 - OpenTelemetry
 - Elastic
---

# OpenTelemetry × Elastic Observability 系列（一）： 整体架构介绍

本文是 **OpenTelemetry × Elastic Observability 系列**的第一篇，将介绍 OpenTelemetry Demo 的整体架构，以及如何集成 Elastic 来采集和可视化可观测性数据。后续文章将分别针对不同编程语言，深入讲解 OpenTelemetry 的集成实践。

## 程序架构

[OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) 是由 OpenTelemetry 社区开发的微服务演示应用程序，用于展示 OpenTelemetry (OTel) 的插桩（Instrumentation）和可观测性能力。OpenTelemetry Demo 是一个电子商务网页，由多个通过 HTTP 和 gRPC 相互通信的微服务组成。所有服务都使用 OpenTelemetry 进行插桩，并生成链路追踪（trace）、指标（metric）和日志（log）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301150987.png)

下表列出了应用程序中的各个微服务的介绍及其使用的编程语言：

| 服务                                  | 编程语言        | 描述                                                                                                                               |
| ------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| accounting             | .NET          | 处理传入的订单并计算所有订单的总和。                                                                                      |
| ad                             | Java          | 根据给定的上下文关键词提供文本广告。                                                                                             |
| cart                         | .NET          | 在 Valkey 中存储用户购物车中的商品并检索它们。                                                                                   |
| checkout                 | Go            | 检索用户购物车，准备订单并协调支付、配送和电子邮件通知。                                                                       |
| currency                 | C++           | 将一种货币金额转换为另一种货币。使用从欧洲中央银行获取的实际汇率。                         |
| email                       | Ruby          | 向用户发送订单确认电子邮件。                                                                                             |
| fraud-detection   | Kotlin        | 分析传入的订单并检测欺诈尝试。                                                                                           |
| frontend                 | TypeScript    | 提供 HTTP 服务器来服务网站。不需要注册/登录，自动为所有用户生成会话 ID。                                                        |
| load-generator     | Python/Locust | 持续发送请求，模拟真实用户购物流程到前端。                                                                                       |
| payment                   | JavaScript    | 使用给定的信用卡信息收取指定金额并返回交易 ID。                                                                         |
| product-catalog   | Go            | 从 JSON 文件提供产品列表，并能够搜索产品和获取单个产品。                                                                        |
| quote                       | PHP           | 根据要运送的商品数量计算运费。                                                                                                   |
| recommendation     | Python        | 根据购物车中的商品推荐其他产品。                                                                                                 |
| shipping                 | Rust          | 根据购物车提供运费估算。将商品运送到指定地址。                                                                         |
| react-native-app | TypeScript    | React Native 移动应用程序，在购物服务之上提供用户界面。                                                                         |

## 启动程序

Elastic 提供了 [OpenTelemetry Demo 的 Elastic Observability 版本](https://github.com/elastic/opentelemetry-demo)，该版本使用了 Elastic Distributions of OpenTelemetry (EDOT) 来为应用程序进行插桩。[Elastic Distributions of OpenTelemetry（EDOT）](https://www.elastic.co/docs/reference/opentelemetry) 是为 Elastic 量身打造的 OpenTelemetry 开源发行版生态，包含定制化的 OpenTelemetry Collector 和多个 OpenTelemetry 语言 SDK。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301227959.png)

Elastic 提供的 OpenTelemetry Demo 依赖于 [Elastic Cloud](https://cloud.elastic.co/)，该平台提供开箱即用的 APM Server、Elasticsearch 和 Kibana 等服务。为了方便用户在本地搭建和运行环境，我对该项目进行了一些修改，使其支持本地部署 APM Server、Elasticsearch、Kibana 等组件。你可以直接克隆我修改后的项目来运行：

```bash
git clone https://github.com/cr7258/hands-on-lab.git
cd observability/opentelemetry-elastic/opentelemetry-demo
# 使用 Docker Compose 启动项目
make start
```

## 网站界面

启动成功后，浏览器输入 `http://localhost:8080/` 可以访问网站的前端界面。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301144156.png)

你可以在网站上将商品加入购物车并进行结算。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301144705.png)

## 负载测试

Load Generator 基于 Python 负载测试框架 Locust 编写。默认情况下，它将模拟用户请求前端的多个不同路由。浏览器输入 `http://localhost:8080/loadgen/` 可以访问 Load Generator 的 Web 界面。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301145639.png)

## 功能标志

Demo 应用提供了多个功能标志（Feature Flag），可用于模拟不同的场景和故障。这些标志由 [flagd](https://flagd.dev/) 管理，这是一个支持 [OpenFeature](https://openfeature.dev/) 的简单功能标志服务。

运行 Demo 时，可以通过访问 `http://localhost:8080/feature` 的用户界面来更改这些标志的值。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301145995.png)

## Elastic Observability

通过浏览器访问 `http://localhost:5601/` 可打开 Kibana 的 Web 界面。在 **Observability -> APM** 页面中，可以查看与 Elastic Observability 应用相关的可观测性数据。

Elastic Observability 提供全栈可观测性方案，通过支持 APM 和 OpenTelemetry，实现日志、指标和链路追踪的统一分析与可视化。它帮助团队加速故障排查、提升系统透明度，并降低运维成本。

[Service Map](https://www.elastic.co/docs/solutions/observability/apm/service-map) 是 Elastic Observability 的核心功能之一，它实时地展示了应用程序中各服务之间的依赖关系和交互情况。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301119214.png)

Service Inventory 列出了所有的服务以及每个服务的关键指标（延时、吞吐量、失败率等）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301121089.png)

[Trace](https://www.elastic.co/docs/solutions/observability/apm/traces-ui) 以瀑布图的形式展示请求在各个微服务间的完整调用链，包含请求方法、耗时、状态码等关键信息，帮助用户快速定位性能瓶颈或异常问题。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301128145.png)

如果想要查看某条 trace 关联的信息，可以点击 `Investigate` 按钮。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301129123.png)

然后可以选择查看该 trace 关联的日志。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301129666.png)

或者是该 trace 的 Service Map。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505301131219.png)

## 总结

本文介绍了 OpenTelemetry Demo 的整体架构，并演示了如何借助 Elastic Observability 实现链路追踪、日志与指标的统一观测。这是 OpenTelemetry × Elastic Observability 实践系列的第一篇文章，在后续的文章中，我们将深入探讨不同编程语言（如 Java、Go、Node.js 和 Python）的 OpenTelemetry 集成实践。

## 参考资料

- OpenTelemetry Demo Docs：https://opentelemetry.io/docs/demo/
- Elastic Distributions of OpenTelemetry：https://www.elastic.co/docs/reference/opentelemetry
- OpenTelemetry Demo with the Elastic Distributions of OpenTelemetry：https://www.elastic.co/observability-labs/blog/opentelemetry-demo-with-the-elastic-distributions-of-opentelemetry
- elastic/opentelemetry-demo：https://github.com/elastic/opentelemetry-demo
- Use OpenTelemetry with APM：https://www.elastic.co/docs/solutions/observability/apm/use-opentelemetry-with-apm
- Native OpenTelemetry support in Elastic Observability：https://www.elastic.co/observability-labs/blog/native-opentelemetry-support-in-elastic-observability
- Combining Elastic Universal Profiling with Java APM Services and Traces：https://www.elastic.co/observability-labs/blog/universal-profiling-with-java-apm-services-traces
- Revealing unknowns in your tracing data with inferred spans in OpenTelemetry：https://www.elastic.co/observability-labs/blog/tracing-data-inferred-spans-opentelemetry
- elastic/observability-examples：https://github.com/elastic/observability-examples/tree/main/Elastiflix