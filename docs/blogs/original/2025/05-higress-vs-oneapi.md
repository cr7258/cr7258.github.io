---
title: AI 网关对决：Higress 与 OneAPI 的功能对比
author: Se7en
date: 2025/01/22 22:30
categories:
 - AI
tags:
 - Higress
 - AI
---

# AI 网关对决：Higress 与 OneAPI 的功能对比

## 什么是 AI 网关？

AI 网关旨在统一管理与各种大型语言模型（LLMs）的交互。通过提供单一入口点，它解决了使用来自不同供应商的多个 AI 模型所带来的复杂性问题。这不仅简化了访问流程，提高了系统稳定性，还降低了成本，并灵活地利用了不同模型的优势。

## 什么是 OneAPI？

[OneAPI](https://github.com/songquanpeng/one-api) 是一个开源的 LLM API 管理 & 分发系统，可以帮助统一管理和转发各类大语言模型（如 DeepSeek 等）的 API 请求。它提供了一个兼容 OpenAI API 格式的统一接口，让用户能够方便地切换和管理不同的 AI 模型服务，同时支持令牌管理、负载均衡等功能。

## 什么是 Higress?

[Higress](https://github.com/alibaba/higress) 是一款云原生 API 网关，内核基于 Istio 和 Envoy，可以用 Go/Rust/JS 等编写 Wasm 插件，提供了数十个现成的通用插件。Higress 在阿里内部为解决 Tengine reload 对长连接业务有损，以及 gRPC/Dubbo 负载均衡能力不足而诞生。阿里云基于 Higress 构建了云原生 API 网关产品，为大量企业客户提供 99.99% 的网关高可用保障服务能力。

Higress 同时也能够作为 AI 网关，通过统一的协议对接国内外所有 LLM 模型厂商，同时具备丰富的 AI 可观测、多模型负载均衡/fallback、AI token 流控、AI 缓存等能力。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502132101971.png)

## Higress 和 OneAPI 的对比

下面的表格从多个维度对比了 OneAPI 和 Higress 之前的差异：

| 差异项 | OneAPI | Higress |
| :--- | :--- | :--- |
| **核心功能** | AI 网关 | 具有 AI 网关功能的 API 网关 |
| **维护方式** | 由个人维护的项目 | 由阿里云 API 网关团队维护的项目 |
| **系统安全** | 易受[安全漏洞](https://mp.weixin.qq.com/s/cGMVehT-8QSKLwbNLnFdHQ)影响，如 DockerHub 镜像被注入加密挖矿脚本 | 商业版由阿里云托管，无此风险；开源版本集成了阿里云容器镜像服务以存储镜像，提供安全扫描和自动阻止风险镜像的功能 |
| **内容安全** | 无 | 通过集成阿里云内容安全实现实时内容过滤，同时支持数据脱敏等功能 |
| **模型管理** | 只有模型和 API Key 配置管理 | 支持 API Key 管理（多密钥轮询、屏蔽不可用密钥）、消费者管理（API Key 二级分发、访问控制）、兜底模型以及模型灰度发布。 |
| **可观测性** | 无 | 提供监控仪表板用于查看模型及消费者令牌消耗和调用延迟。提供全面的可观测性，包括内容安全、速率限制和缓存的监控。 |
| **可扩展性** | 无 | 插件市场提供了现成插件（提示词模板、AI缓存、数据脱敏、内容安全），支持自定义插件开发及热加载。 |
| **云集成** | 无 | 可以和阿里云上的各类云产品集成，例如借助 SLS 实现 AI [数据分析能力](https://mp.weixin.qq.com/s/0NokzM9SGPkAJgl0c9JiEA) |

## **Higress 作为 AI 网关的优势**

Higress 作为 AI 网关，具备以下几大优势：

- **统一管理与灵活扩展**：Higress 提供一个集中的入口，能够统一管理多个大型语言模型（LLMs），简化了与不同供应商模型的接入和配置，支持灵活扩展，方便在需求变化时加入新的模型。
- **高可用性与稳定性**：Higress 通过自动故障转移机制，确保当某个 AI 模型服务不可用时，能够快速切换到备选模型，保持系统的高可用性和稳定性，极大减少了服务中断的风险。
- **AI 缓存**：Higress 支持将 AI 模型的结果缓存在 Elasticsearch、Redis、Weaviate 等数据库中。这样不仅可以在后续处理相似问题的请求时快速返回结果，还能减少 LLM 调用的费用开销。
- **意图识别**：Higress 能根据用户需求智能地选择最合适的 LLM，从而在不同场景下提供最佳响应。
- **API Key 治理**：支持配置 API Key 池实现多 Key 均衡，API Key 被限流等不可用情况会自动屏蔽，并在可用时自动恢复。
- **消费者管理**：可以通过创建消费者，实现 API Key 的二次分租，无需将真正的供应商 API Key 暴露给调用方，并且可以精细化管理不同消费者的调用权限和调用额度。
- **强大的可观测性**：Higress 提供关于模型性能、令牌使用情况及安全相关指标的详细洞察，帮助团队全面监控系统健康状况。
- **云原生集成**：与阿里云服务紧密集成，Higress 提供了托管的云原生 API 网关选项，简化了云环境中的部署与管理。
- **内容安全**：Higress 集成了阿里云内容安全技术，为 AI 内容提供强大的安全保障。

## 快速体验 Higress AI 网关

Higress AI 网关支持一行命令安装：

```bash
curl -sS https://higress.cn/ai-gateway/install.sh | bash
```

执行完命令后可以通过命令行初始化配置，可以看到，Higress 的 AI 网关能力支持对接国内外所有主流 LLM 模型供应商：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502132048127.png)

也可以选择跳过这个步骤，到 Higress 的控制台进行配置对应供应商的 API Key：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502132048913.png)

```python
import json
from openai import OpenAI

client = OpenAI(
    api_key=xxxxx, # 👉 可以通过 Higress 生成消费者 Key 实现 API Key 的二次分租
    base_url="http://127.0.0.1:8080/v1"
)

completion = client.chat.completions.create(
    model="deepseek-chat", # 👉 可以填写任意模型名称，Higress 会根据模型名称路由到对应的 LLM 供应商
    messages=[
        {"role": "user", "content": "你好"}
    ],
    stream=True
)

for chunk in completion:
    print(chunk.choices[0].delta)
```

可以在监控面板看到每个模型，以及每个消费者的 token 消耗情况以及调用延时：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502132049888.png)

## 参考链接

- Higress：https://github.com/alibaba/higress
- OneAPI：https://github.com/songquanpeng/one-api
