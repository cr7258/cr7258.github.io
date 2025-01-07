---
title: 一文带你入门 MCP（模型上下文协议）
author: Se7en
date: 2025/01/07 13:30
categories:
 - AI
tags:
 - MCP
 - AI
---

## 什么是 MCP？

MCP（Model Context Protocol，模型上下文协议） 是由 Anthropic 推出的一种开放标准，旨在统一大型语言模型（LLM）与外部数据源和工具之间的通信协议。MCP 的主要目的在于解决当前 AI 模型因数据孤岛限制而无法充分发挥潜力的难题，MCP 使得 AI 应用能够安全地访问和操作本地及远程数据，为 AI 应用提供了连接万物的接口。

## MCP 架构

MCP 遵循客户端-服务器架构（client-server），其中包含以下几个核心概念：

- **MCP 主机（MCP Hosts）**：发起请求的 LLM 应用程序（例如 Claude Desktop、IDE 或 AI 工具）。
- **MCP 客户端（MCP Clients）**：在主机程序内部，与 MCP server 保持 1:1 的连接。
- **MCP 服务器（MCP Servers）**：为 MCP client 提供上下文、工具和 prompt 信息。
- **本地资源（Local Resources）**：本地计算机中可供 MCP server 安全访问的资源（例如文件、数据库）。
- **远程资源（Remote Resources）**：MCP server 可以连接到的远程资源（例如通过 API）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071502607.png)


## MCP Client

MCP client 充当 LLM 和 MCP server 之间的桥梁，MCP client 的工作流程如下：

- MCP client 首先从 MCP server 获取可用的工具列表。
- 将用户的查询连同工具描述通过 [function calling](https://platform.openai.com/docs/guides/function-calling) 一起发送给 LLM。
- LLM 决定是否需要使用工具以及使用哪些工具。
- 如果需要使用工具，MCP client 会通过 MCP server 执行相应的工具调用。
- 工具调用的结果会被发送回 LLM。
- LLM 基于所有信息生成自然语言响应。
- 最后将响应展示给用户。

你可以在 [Example Clients](https://modelcontextprotocol.io/clients) 找到当前支持 MCP 协议的客户端程序。本文将会使用 Claude Desktop 作为 MCP client，你可以在此页面下载安装：https://claude.ai/download 。

## MCP Server

MCP server 是 MCP 架构中的关键组件，它可以提供 3 种主要类型的功能：

1. 资源（Resources）：类似文件的数据，可以被客户端读取，如 API 响应或文件内容。
2. 工具（Tools）：可以被 LLM 调用的函数（需要用户批准）。
3. 提示（Prompts）：预先编写的模板，帮助用户完成特定任务。

这些功能使 MCP server 能够为 AI 应用提供丰富的上下文信息和操作能力，从而增强 LLM 的实用性和灵活性。

你可以在 [MCP Servers Repository](https://github.com/modelcontextprotocol/servers) 和 [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) 这两个 repo 中找到许多由社区实现的 MCP server。使用 TypeScript 编写的 MCP server 可以通过 [npx](https://docs.npmjs.com/cli/v8/commands/npx) 命令来运行，使用 Python 编写的 MCP server 可以通过 [uvx](https://docs.astral.sh/uv/concepts/tools/) 命令来运行。

## 使用 Claude Desktop 通过 PostgreSQL MCP Server 查询数据库信息

接下来演示通过 [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) 使 LLM 能够基于 PostgreSQL 中的数据来回答问题。

### 准备 PostgreSQL 数据

首先使用 Docker 启动 PostgreSQL 服务。

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres -p 5432:5432 \
  postgres
```

在 PostgreSQL 中创建数据库和表，并插入数据。

```sql
-- 登录 PostgreSQL
docker exec -it postgres psql -U postgres

-- 创建数据库
CREATE DATABASE shopdb;

-- 连接到新创建的数据库
\c shopdb;

-- 创建 users 表
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- 创建 orders 表
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    user_id INT REFERENCES users(user_id)
);

-- 插入示例数据
INSERT INTO users (first_name, last_name, email) VALUES
('John', 'Doe', 'john.doe@example.com'),
('Jane', 'Smith', 'jane.smith@example.com'),
('Alice', 'Johnson', 'alice.johnson@example.com');

INSERT INTO orders (order_date, total_amount, user_id) VALUES
('2025-01-05 10:30:00', 150.75, 1),
('2025-01-06 11:00:00', 200.50, 2),
('2025-01-07 12:45:00', 120.25, 1);
```

### 配置连接 PostgreSQL MCP Server

在 Claude Desktop 中配置 PostgreSQL MCP Server 的连接信息，具体内容可以参考：[For Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user)。最终是在 `claude_desktop_config.json` 文件中添加如下内容：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:postgres@127.0.0.1/shopdb"
      ]
    }
  }
}
```

配置完毕后，重启 Claude Desktop。一切正常的话，你应该能在输入框的右下角看到一个锤子图标。点击锤子图标，可以看到 PostgreSQL MCP Server 提供的工具信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071632927.png)


### 根据 PostgreSQL 的数据进行提问

首先来问一个简短的问题：**数据库中有哪些表？** Claude 会判断出需要调用 MCP server 来查询 PostgreSQL 中的数据。这里会弹出一个窗口，需要用户授权。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071636327.png)

点击 Allow 后，Claude 成功返回了结果。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071706654.png)

接下来我们可以增加一点难度：查询**金额最高的订单信息**。在数据库中有两张表 `users` 和 `orders`，要想得到完整的订单信息，需要先去查询 `orders` 表中金额最高的一条记录，然后根据 `user_id` 这个外键再去查询 `users` 表中对应的用户信息。 

从下面的输出可以发现 Claude 一开始是不知道数据库中的表结构的，因此先发送请求分别确定 `orders` 表和 `users` 表中相应的字段，然后再对两张表进行 join 查询。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071635588.png)


点击 `View Result from query from postgres` 可以看到 Claude Desktop 向 MCP server 发送的请求以及得到的响应，说明这个结果确实是从 PostgreSQL 数据库中查询得到的。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071637075.png)

你也可以复制这条 SQL 语句到数据库中查询进行确认。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071638683.png)

## 总结

本文带领读者快速入门了 MCP（模型上下文协议），介绍了其架构、核心概念以及实际应用场景。通过演示 Claude Desktop 结合 PostgreSQL MCP Server 查询数据库的场景，展示了 MCP 如何增强 LLM 与外部数据源的交互能力。后续文章还会继续分享 MCP server 和 MCP client 开发的相关内容，欢迎持续关注。


## 参考资料
- Model Context Protocol 官方文档：https://modelcontextprotocol.io/introduction
- 深度解析：Anthropic MCP 协议：https://mp.weixin.qq.com/s/ASmcjW53HKokdYt1m-xyXA
