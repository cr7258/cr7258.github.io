---
title: Dify + OceanBase + MCP：三剑合璧，轻松构建 RAG 应用
author: Se7en
date: 2025/06/27 11:50
categories:
 - AI
tags:
 - AI
 - RAG
 - Dify
 - OceanBase
 - MCP
---

# Dify + OceanBase + MCP：三剑合璧，轻松构建 RAG 应用

在 AI 应用开发领域，检索增强生成（Retrieval Augmented Generation，RAG）已成为构建智能问答、文档分析等场景的核心技术。通过 RAG，AI 应用能够结合现有知识库，在生成回答时引入外部信息，从而为用户提供更准确、更智能的响应。本文将通过一个实践案例，展示如何使用 Dify、OceanBase 和 MCP，从零开始构建一个功能完备的 RAG 应用。

**Dify** 是一个开源的 LLM 应用开发平台，它提供了友好的图形化界面，让开发者可以快速编排和部署 AI 应用和工作流。

**OceanBase** 是由阿里巴巴和蚂蚁集团自主研发的分布式关系型数据库，专为大规模数据处理、高并发访问及金融级可用性场景而设计。它不仅支持传统的结构化数据管理与事务处理，从 4.3.3 版本开始，还原生支持向量数据类型，满足 AI 及语义检索等新兴应用需求。

**MCP（Model Context Protocol，模型上下文协议）** 是由 Anthropic 公司于 2024 年 11 月推出并开源的开放协议，旨在实现大语言模型（LLM）与外部工具、数据源的高效交互。MCP 通过标准化的接口，让 AI 系统能够实时访问和调用数据库、API 及其他服务，从而打破“数据孤岛”，提升 AI 应用的实时性、可操作性和协作能力。

## 部署 OceanBase

OceanBase 提供了多种[部署方式](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000002012734)，例如通过 Docker、Kubernetes、OBD（OceanBase Deployer）和 OceanBase 桌面版等。为了方便实验，本文将使用 OceanBase 桌面版来部署 OceanBase。

> 注意：OceanBase 桌面版仅适用于学习或测试场景，请不要应用于生产环境。

安装 OceanBase 桌面版，可以参考该文档：https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000002866370

OceanBase 桌面版安装完成后，将看到如下界面：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506272140339.png)

默认情况下，OceanBase 会创建两个租户 `sys` 和 `test`，我们将在 `test` 租户下创建 Dify 使用的向量数据库。第一次需要为 `test` 租户设置密码。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506262327780.png)


在 `数据库管理` 页面中，新增一个名为 `rag` 的数据库。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506270955246.png)

## 部署 Dify

在本文中，我们将使用 OceanBase 作为 Dify 的向量数据库，用于存储 RAG 应用所需的知识库内容。与此同时，Dify 还需要一个关系型数据库来存储元数据。目前 Dify 官方仓库（最新版为 v1.5.0）仅支持 PostgreSQL，尚不支持 MySQL。

OceanBase 社区基于 Dify v0.14.2 分支进行了改造，使其支持使用兼容 MySQL 协议的数据库来存储结构化数据，相关代码和文档在 [oceanbase-devhub/dify](https://gitee.com/oceanbase-devhub/dify) 仓库中。如果你希望同时使用 OceanBase 作为向量数据库和关系型数据库，可以参考该版本进行部署。

此前，OceanBase 社区也曾向 Dify 官方提交支持 MySQL 的 PR（Make Dify compatible with MySQL database：https://github.com/langgenius/dify/pull/8364 ），但该 PR 未被 Dify 社区采纳。为了能够使用 Dify 的最新功能（例如 MCP Server 插件），本文将基于官方最新的 v1.5.0 版本，分别使用 OceanBase 和 PostgreSQL 作为向量数据库和关系型数据库。

启动 Dify 服务器最简单的方式是通过 Docker Compose。首先，克隆 Dify 仓库。进入 Dify 的 `docker` 目录，复制一份环境变量配置文件。

```bash
git clone https://github.com/langgenius/dify.git
cd dify
cd docker
cp .env.example .env
```

然后，编辑 `.env` 文件，将 `VECTOR_STORE` 设置为 `oceanbase`，并填入 OceanBase 的连接信息。

```bash
VECTOR_STORE=oceanbase

OCEANBASE_VECTOR_HOST=198.19.249.160
OCEANBASE_VECTOR_PORT=2881
OCEANBASE_VECTOR_USER=root@test
OCEANBASE_VECTOR_PASSWORD=<your_password>
OCEANBASE_VECTOR_DATABASE=rag
```

OceanBase 的 IP 地址可以在 OceanBase 桌面版部署所使用的虚拟机中获取。在 macOS 上，OceanBase 桌面版是通过 OrbStack 启动虚拟机进行部署的。你可以在 OrbStack 的 `Machines` 界面点击 `Terminal` 按钮进入对应虚拟机，并通过 `ip addr` 命令查看其 IP 地址。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506272242380.png)

在输出信息中找到 `eth0` 网卡的 `inet` 地址，例如 `198.19.249.160`，这就是连接 OceanBase 所需要用到的 IP。

```bash
admin@oceanbase-desktop:~$ ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host proto kernel_lo 
       valid_lft forever preferred_lft forever
2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/ipip 0.0.0.0 brd 0.0.0.0
3: sit0@NONE: <NOARP> mtu 1480 qdisc noop state DOWN group default qlen 1000
    link/sit 0.0.0.0 brd 0.0.0.0
4: ip6tnl0@NONE: <NOARP> mtu 1452 qdisc noop state DOWN group default qlen 1000
    link/tunnel6 :: brd :: permaddr a2c4:a96f:bb63::
5: eth0@if17: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether a6:e9:47:13:6a:81 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 198.19.249.160/24 metric 100 brd 198.19.249.255 scope global dynamic eth0
       valid_lft 168908sec preferred_lft 168908sec
    inet6 fd07:b51a:cc66:0:a4e9:47ff:fe13:6a81/64 scope global mngtmpaddr noprefixroute 
       valid_lft forever preferred_lft forever
    inet6 fe80::a4e9:47ff:fe13:6a81/64 scope link proto kernel_ll 
       valid_lft forever preferred_lft forever
```

修改完环境变量配置后，执行以下命令启动 Dify 服务。

```bash
docker compose up -d
```

> 可选：Dify 的 `docker-compose.yaml` 文件中其实也包含了 OceanBase 的容器配置。但由于我们已经通过 OceanBase 桌面版完成了部署，因此可以选择将其中的 [OceanBase 容器配置](https://github.com/langgenius/dify/blob/1.5.0/docker/docker-compose.yaml#L950-L975)注释掉，避免启动一个多余的容器。

服务启动后，浏览器输入 `http://localhost` 即可访问 Dify 的 Web 界面。第一次登录需要设置用户名和密码。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506262353541.png)

## 设置模型供应商

点击右上角的头像，选择`设置`进入设置页面。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506272252841.png)

点击`模型供应商`，这里我选择将通义千问作为模型供应商。读者也可以自行选择其他模型供应商。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271010973.png)

在 `API Key` 中填入通义千问的 API Key，然后点击 `保存`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271011692.png)

选择默认的`系统模型`，这里主要需要设置`系统推理模型`和 `Embedding 模型`，大家可以根据自己的喜好自行选择。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271012508.png)

## 索引知识库

完成模型设置后，接下来可以开始索引知识库了。回到首页，点击顶端的 `知识库` 标签页，进入知识库管理界面，点击`创建知识库`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506272258713.png)

选择`导入已有文本`，可以直接拖入文件进行索引。这里我上传了两篇关于大模型推理优化技术 Chunked Prefill 的论文。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271014757.png)

然后设置文本的分段规则，这里可以保留默认设置。点击`预览块`可以在右侧预览分段后的结果。确认没问题后，点击 `保存并处理`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271015078.png)

## 创建对话应用

点击`工作室`标签页，进入应用管理界面，点击`创建空白应用`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271017254.png)

选择`聊天助手`，并填写`应用名称`。输入完成后点击`创建`按钮。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271017269.png)

添加上一步索引的知识库作为聊天助手的上下文。然后可以在右侧聊天框里进行应用调试，例如询问`什么是 Chunked Prefill？`。从输出可以看到，AI 会根据文档内容生成回答，并附上引用的来源片段。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271019709.png)

点击文件图标，可以看到具体引用的内容。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271020639.png)

确认无误后，点击右上角的`发布`按钮。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271021003.png)

然后就可以在聊天助手中进行提问了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271022891.png)

## 将 Dify 应用转换为 MCP Server

Dify 也可以作为一个 MCP Server，使你构建的 AI 应用能够被其他 MCP 客户端（如 Cursor、Windsurf、Cherry Studio 等）调用，从而拓展更多使用场景。[mcp-server](https://marketplace.dify.ai/plugins/hjlarry/mcp-server?language=en-US) 插件由 Dify 社区贡献，是一种扩展类型插件。安装后，可将任意 Dify 应用转化为符合 MCP 标准的服务端点，供外部 MCP 客户端直接访问。

在 Dify 的 `Marketplace` 中选择 `MCP server` 插件进行安装。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271023065.png)

接下来，设置 MCP Server，`App` 选择上一步发布的聊天助手应用。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271038125.png)

按照 MCP 规范，我们需要为工具提供一个清晰的输入模式。对于聊天 Dify 应用，确保在输入模式中包含一个 `query` 字段，格式如下：

```json
{
    "name": "search_paper",
    "description": "Search information from Paper.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The keywords for search."
            }
        },
        "required": [
            "query"
        ]
    }
}
```

配置完 MCP Server 后，就可以得到一个 MCP Server 的端点，Dify 提供了 SSE 和 Streamable HTTP 两种端点，这里我们选择 `/mcp` 后缀的 Streamable HTTP 端点。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271039074.png)

将端点 URL 复制到 MCP Client，这里我使用 Cherry Studio。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271033132.png)

配置完成后，在聊天界面选择配置的 Dify MCP Server。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271033775.png)

接着我们尝试询问一个与知识库内容相关的问题。但调用 Dify MCP Server 后并没有得到预期的回答，展开返回结果可以看到仅返回了 `<think>`。这是因为我此前选择的推理模型 `qwen3-32b` 采用了混合思维模式，该模式允许 Qwen3 根据用户需求在“深度思考”和“快速响应”之间灵活切换。看起来是因为模型进入了深度思考模式，导致未能正常返回 Dify MCP Server 的调用结果。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271042505.png)

解决方法就是将推理模型切换为没有深度思考模式的模型，例如 `qwen-turbo`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271041152.png)

现在再次询问一个与知识库内容相关的问题，就能从 Dify MCP Server 得到预期的回答了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506271038821.png)

## 总结

本文详细介绍如何结合 Dify、OceanBase 和 MCP 从零开始构建一个功能完备的 RAG 应用。教程涵盖了从部署环境、创建知识库、到构建聊天助手并进行调试的全过程。最后，文章还演示了如何将 Dify 应用转化为一个标准的 MCP Server，使其能被外部客户端调用，从而极大地扩展了 AI 应用的集成与协作能力。

## 参考资料

- [安装 OceanBase 桌面版](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000002866370)
- [MySQL Authentication Plugin Issues on macOS](https://stackoverflow.com/questions/78938322/mysql-authentication-plugin-issues-on-macos)
- [Dify MCP Plugin Hands-On Guide: Integrating Zapier for Effortless Agent Tool Calls](https://dify.ai/blog/dify-mcp-plugin-hands-on-guide-integrating-zapier-for-effortless-agent-tool-calls)
- [Turn Your Dify App into an MCP Server](https://dify.ai/blog/turn-your-dify-app-into-an-mcp-server)
- [Dify MCP server](https://marketplace.dify.ai/plugins/hjlarry/mcp-server)

## 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202503222156941.png)
