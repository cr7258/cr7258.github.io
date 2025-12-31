---
title: 零代码：使用 Higress 将 REST API 秒变 MCP Server
author: Se7en
date: 2025/12/31 12:00
categories:
 - AI
tags:
 - AI
 - Gateway
---

# 零代码：使用 Higress 将 REST API 秒变 MCP Server

## 1 什么是 MCP？

MCP（Model Context Protocol） 是一个统一接口，用于让 AI Agent 能够动态地与外部工具、服务和数据源交互。它标准化了模型获取实时信息、执行操作的方式。

通过 MCP，任何现有系统——无论是数据库、REST API，还是内部服务——都可以被封装成 MCP Server，并被 Cursor、Claude 等兼容 MCP 的客户端直接使用。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251130222042010.png)

## 2 如何编写 MCP Server

当前，如果想让 REST API 接口变成可被 AI Agent 调用的 MCP 工具，通常需要使用对应语言的 MCP SDK 来编写代码。例如下面这个例子，是一个用 FastAPI 写的简单 UUID REST API。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251130222633565.png)


在 FastMCP 中，你需要使用 `@mcp.tool` 装饰器将某个函数注册为 MCP 工具，并通过函数的类型注解和 docstring 来描述工具的输入参数和说明。虽然实现起来不算复杂，但仍然需要编写一定的代码。

而 Higress 则提供真正意义上的零代码方案——无需编写任何代码，只需少量配置，就能将任意 REST API 转换为 MCP Server。

在这篇文章中，我将带你手把手完成从零开始的全套流程：部署并配置 Higress、将 REST API 自动映射为 MCP 工具，并使用 Nacos 作为 MCP Registry，实现 MCP 配置的统一管理与动态下发。
## 3 存量 REST API 服务

在本文中，我们以 `httpbin.org` 提供的 UUID REST API 为例。该接口无需任何请求参数，会直接返回一个随机生成的 UUID。

```bash
curl http://httpbin.org/uuid

# 响应内容
{
  "uuid": "4b4491f6-0548-49d2-b055-587f9b37162d"
}
```

## 4 部署 Higress

为便于实验，我们将使用 `higress/all-in-one:2.1.9` 镜像来部署 Higress。而在生产环境中，通常会通过 Helm Chart 在 Kubernetes 集群中进行安装。

其中 Redis 组件为可选项：如果使用 MCP 的 SSE 协议，则需要依赖 Redis 做会话管理；而在使用 MCP Streamble HTTP 协议时，则无需配置 Redis。

```bash
docker network create mcp

docker run -d --name higress -v ${PWD}:/data \
        -p 8001:8001 -p 8080:8080 -p 8443:8443 --network mcp \
        higress-registry.cn-hangzhou.cr.aliyuncs.com/higress/all-in-one:2.1.9
        
docker run -d --name higress-redis -p 6379:6379 \
--network mcp higress-registry.cn-hangzhou.cr.aliyuncs.com/higress/redis-stack-server:7.4.0-v3
```

Higress 容器启动成功以后，可以通过 `http://localhost:8001` 访问 Higress Dashboard。进入 **系统配置** 页面，启用 `mcpServer` 功能，并配置 Redis 地址。由于 `higress-redis` 与 `higress` 容器位于同一 Docker 网络中，因此可以直接通过容器名进行访问。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129204256736.png)

## 5 配置 MCP Server

### 5.1 创建服务来源

在 Higress 控制台添加目标 REST API 的服务来源。本示例使用 `httpbin.org` 作为服务来源。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214403629.png)

### 5.2 创建 MCP 服务
点击 **AI 网关管理** -> **MCP 管理**，进入 MCP 管理界面。点击**创建 MCP 服务**：
- 输入 MCP 服务名称和描述
- 服务类型选择 `OpenAPI`
- 后端服务关联上一步创建的 `httpbin` 服务来源。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214503837.png)
配置 OpenAPI 类型的 MCP 服务，需要在创建后编辑工具，可以使用 OpenAPI/Swagger 规范或者配置 MCP YAML 配置，这里以 MCP YAML 配置为例：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214534815.png)**requestTemplate** 用于定义 Higress 应该如何构造发送到你现有 REST API 的 HTTP 请求。  
它可以指定内容包括：
- HTTP 方法（GET、POST 等）
- URL 与路径参数
- 请求头
- 查询参数
- 请求体

**responseTemplate** 用于定义 Higress 应该如何将后端 REST 的响应转换成结构化、干净的 MCP 响应，以便 MCP 客户端（如 Cursor、Claude、OpenAI）进行消费。它通常用于：
- 仅提取关键字段
- 对复杂 JSON 结构进行简化
- 将数据格式化为更适合 LLM 的结构

```yaml
server:
  name: uuid
tools:
  - description: "Generate random UUID"
    name: uuid
    requestTemplate:
      method: GET
      url: http://httpbin.org/uuid
    responseTemplate:
      body: "{{.}}"
```

MCP Server 配置文档参考：https://higress.cn/ai/mcp-server

配置完成后，即可通过生成的 URL 访问该 MCP Server，访问地址为：  
`http://<higress-gateway-ip>/mcp-servers/<mcp-server-name>`

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214552343.png)

## 6 配置 MCP Client

这里我以 Windsurf 作为 MCP Client，将上面的 MCP 配置直接复制到 Windsurf 的 MCP 配置中即可。你也可以选择任何支持 MCP 的 AI IDE 或 AI Chatbot。记得将 `higress-gateway-ip` 替换为 `localhost:8080`。

```json
{
  "mcpServers": {
    "uuid": {
      "url": "http://localhost:8080/mcp-servers/uuid"
    }
  }
}
```

让 Windsurf 调用 MCP 工具生成一个随机的 UUID。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129211521261.png)

## 7 使用 Nacos 作为 MCP Registry

使用 Nacos MCP Registry 的优势在于：
- 统一注册与动态发现：所有 MCP Server（包括存量 API 转换、自研、第三方的）均可以注册到 Nacos 进行统一管理。
- MCP 信息动态下发实时生效：Nacos 可以动态管理和下发 MCP 信息、Tools 及 Prompt。
- MCP 版本与灰度管理：Nacos 天然支持配置的历史版本管理和灰度发布。当需要调整 Tool 描述时，可以对比不同版本描述对 AI 调用效果的影响，确保变更平稳、可控，并可在出现问题时快速回滚。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251130225631963.png)

### 7.1 部署 Nacos

我们可以使用 Docker 来部署 Nacos：
- `NACOS_AUTH_TOKEN`: Nacos 用于生成 JWT Token 的密钥，使用长度大于 32 字符的字符串，再经过 Base64 编码。
- `NACOS_AUTH_IDENTITY_KEY`: Nacos Server 端之间 Inner API 的身份标识的 Key。
- `NACOS_AUTH_IDENTITY_VALUE`: Nacos Server 端之间 Inner API 的身份标识的 Value。

```bash
docker run --name nacos \
    -e MODE=standalone \
    -e NACOS_AUTH_TOKEN=ZzdUOTRwUXhNWjJMc0ExclVGazBuUjV2YllxSDNKZUI4c21LMGFDRA== \
    -e NACOS_AUTH_IDENTITY_KEY=test-key \
    -e NACOS_AUTH_IDENTITY_VALUE=test-value \
    -p 8081:8080 \
    -p 8848:8848 \
    -p 9848:9848 \
    --network mcp \
    -d nacos-registry.cn-hangzhou.cr.aliyuncs.com/nacos/nacos-server:v3.1.1
```

访问 http://localhost:8081 打开 Nacos 控制台，先初始化用户。这里我为默认的 `nacos` 用户设置密码为 `nacos`。
### 7.2 配置 Higress 连接到 Nacos MCP Registry

> 在配置 Higress 连接 Nacos 之前，请先删除 **5.1** 和 **5.2** 小节中创建的服务来源和 MCP 服务。因为这些配置稍后都会通过 Nacos 进行统一管理，并动态下发给 Higress。


在 Higress 控制台添加 `Nacos 3.x` 类型的服务来源：
- 输入 nacos 注册中心地址和端口，Nacos 和 Higress 同样运行在同一个 Docker network 下，因此可以直接通过 `nacos` 容器名进行访问。
- 配置 Nacos 认证的用户名和密码。
- 启用 MCP Server 功能，并将路由路径前缀设置为 `/mcp-servers`。该前缀与 5.2 小节中自动生成的路径保持一致，便于后续直接使用第 6 步的 MCP Client 配置进行重试。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214706250.png)
Higress 侧只需要配置 Nacos 的连接信息即可，接下来进入 Nacos 控制台继续配置 MCP Server。

### 7.3 创建 MCP Server

在 MCP 管理页面，点击 **创建 MCP Server**：
- 协议类型选择 `streamable`
- 输入服务的地址 `httpbin.org`, 端口 `80` 和协议 `HTTP`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214735434.png)


然后为这个 MCP Server 添加一个工具：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214810700.png)

工具的参数复用 **5.2** 小节的 `requestTemplate` 和 `responseTemplate` 配置。

```json
{
  "requestTemplate": {
    "url": "http://httpbin/uuid",
    "method": "GET"
  },
  "responseTemplate": {
    "body": "{{.}}"
  }
}
```

创建完工具以后，点击发布。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214823192.png)

在 Nacos 的服务管理页面中，你会看到 `httpbin.org` 的服务来源已被自动创建。这表示 Higress 会自动发现该 MCP Server，并在有请求到来时将流量转发至对应的服务来源。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20251129214838470.png)

## 8 总结

借助 Higress，你无需编写任何代码，即可将现有 REST API 快速转换为标准化 MCP Server，让 AI Agent 能够直接调用已有系统能力。 结合 Nacos 的注册与配置中心能力，MCP Server、Tools 以及相关配置可以实现统一管理与动态下发，从而构建一个真正可扩展的 AI 工具体系。

## 9 参考资料

- [Higress MCP Server 快速开始](https://higress.cn/ai/mcp-quick-start)
- [手把手带你玩转基于 Nacos + Higress 的 MCP 开发新范式](https://nacos.io/blog/nacos-gvr7dx_awbbpb_lup4w7e1cv6wktac)
- [Higress 新增 MCP 服务管理，助力构建私有 MCP 市场](https://mp.weixin.qq.com/s/CoFyJMX7cHEKUFSSbKtvZQ)

## 10 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
