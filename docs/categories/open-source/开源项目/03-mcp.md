---
title: MCP
author: Se7en
categories:
 - MCP
tags:
 - AI
 - Open Source
 - MCP
---

# MCP (Model Context Protocol，模型上下文协议)

## Multiverse MCP Server

[Multiverse MCP Server](https://github.com/lamemind/mcp-server-multiverse) 是一个中间件 MCP 服务器，旨在使多个相同的 MCP 服务器实例能够在独立的命名空间和配置下共存。这使得以下场景成为可能：

- 多个 MySQL 服务器 mcp-server-mysql 指向不同的数据库。
- 多个 Git 服务器 mcp-server-git，具有不同的个人访问令牌。
- 多个文件系统服务器 mcp-server-filesystem 访问不同的根路径。