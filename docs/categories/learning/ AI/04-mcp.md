---
title: Model Context Protocol（MCP）
author: Se7en
categories:
 - AI
tags:
 - AI
 - MCP
---

# Model Context Protocol（MCP，模型上下文协议）

## 什么是 MCP？

模型上下文协议（MCP）是 Anthropic 推出的开放标准，旨在通过统一的客户端-服务器架构解决 LLM 应用与数据源连接的难题。它支持通过同一协议访问本地资源（如数据库、文件）和远程资源（如 Slack、GitHub API）。

## MCP 架构

MCP 遵循客户端-服务器架构（client-server），其中：

- **MCP 主机（MCP Hosts）**：希望通过 MCP 访问资源的程序（例如 Claude Desktop、IDE 或 AI 工具），用于发起连接。
- **MCP 客户端（MCP Clients）**：与服务器保持 1:1 连接的协议客户端。
- **MCP 服务器（MCP Servers）**：轻量级程序，每个程序都通过标准化模型上下文协议公开特定功能。为客户端提供上下文、工具和 prompt 信息。
- **本地资源（Local Resources）**：你的计算机资源中可供 MCP 服务器安全访问的资源（数据库、文件、服务）。
- **远程资源（Remote Resources）**：MCP 服务器可以连接到的互联网资源（例如通过 API）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501021941097.png)

## MCP Client

MCP client 的工作流程如下：

- MCP client 首先从 MCP server 获取可用的工具列表。
- 将用户的查询连同工具描述通过 [function calling](https://platform.openai.com/docs/guides/function-calling) 一起发送给 LLM。
- LLM 决定是否需要使用工具以及使用哪些工具。
- 如果需要使用工具，Mcp client 会通过 MCP server 执行相应的工具调用。
- 工具调用的结果会被发送回 LLM。
- LLM 基于所有信息生成自然语言响应。
- 最后将响应展示给用户。

以下代码使用的是 [OpenAI](https://github.com/cr7258/hands-on-lab/tree/main/ai/claude/mcp/client/mcp-client) 作为 LLM。[官方示例使用的是 Claude](https://modelcontextprotocol.io/quickstart/client)。

```bash
export OPENAI_API_KEY=sk-xxx
uv run client-openai.py ../../server/weather/src/weather/server.py
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501031826596.png)

## MCP 学习资料


|  资料   | 描述  |
|  ----  | ----  |
| [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)<br>[Model Context Protocol Servers](https://github.com/modelcontextprotocol/servers)  | MCP Server 汇总 |

## 参考资料

- [深度解析：Anthropic MCP 协议](https://mp.weixin.qq.com/s/ASmcjW53HKokdYt1m-xyXA)
- [Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
- [Claude 的 MCP (模型上下文协议）有啥用？](https://sspai.com/post/94360)
- [Claude MCP：claude开源万能数据插头MCP协议](https://www.bilibili.com/video/BV1H5z3YzEii)
- [MCP Server 汇总](https://www.100ai.xyz/mcpservers)
- [Announcing Spring AI MCP: A Java SDK for the Model Context Protocol](https://spring.io/blog/2024/12/11/spring-ai-mcp-announcement)
- [Spring AI 智能体通过 MCP 集成本地文件数据](https://mp.weixin.qq.com/s/Fg59pSdVIGTjDyEC3pAWXQ)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)