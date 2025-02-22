---
title: 提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍
author: Se7en
date: 2025/01/22 22:30
categories:
 - AI
tags:
 - Higress
 - AI
---

# 提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍

在使用 LLM 服务时，服务的稳定性和可用性至关重要。然而，由于网络问题、服务器故障或其他不可控因素，LLM 服务可能会暂时不可用。为了保障用户体验和业务连续性，Higress AI 网关提供了强大的模型降级和令牌降级功能。本文将介绍这两个关键功能，并展示它们如何为 AI 应用提供可靠的服务保障。

## 一键启动 Higress AI 网关

首先启动 Higress AI 网关，仅需一行命令，即可快速在本地搭建好 Higress AI 网关（此步骤需要有 Docker 环境）：

```bash
curl -sS https://higress.cn/ai-gateway/install.sh | bash
```

执行以上命令后，会进入引导界面，可以在此处配置 Provider 的 ApiToken，也可以输入回车直接跳过：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222156467.png)

看到以下界面就表示 Higress AI 网关已经成功启动了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222201154.png)

浏览器输入 http://localhost:8001 就可以访问 Higress 的控制台界面了。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222202304.png)

## 配置 ApiToken

Higress AI 网关内置了主流的 LLM Provider，仅需要在控制台上简单填写 ApiToken 即可完成 Provider 的配置。这里我们分别配置 DeepSeek 和通义千问两个 Provider。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222205245.png)

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222207821.png)

## 请求 DeepSeek 和通义千问

配置完 ApiToken 以后，就可以直接通过 Higress AI 网关来访问 DeepSeek 和通义千问了。

```bash
# 请求 DeepSeek
curl 'http://localhost:8080/v1/chat/completions' \
      -H 'Content-Type: application/json' \
      -d '{
        "model": "deepseek-chat",
        "messages": [
          {
            "role": "user",
            "content": "你是谁？"
          }
        ]
      }'

# 请求通义千问
curl 'http://localhost:8080/v1/chat/completions' \
      -H 'Content-Type: application/json' \
      -d '{
        "model": "qwen-turbo",
        "messages": [
          {
            "role": "user",
            "content": "你是谁？"
          }
        ]
      }'
```

Higress AI 网关已经帮用户预先配置了 AI 路由，可以根据模型名称的前缀来路由到不同的 LLM。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222216282.png)

## 模型降级

Higress AI 网关提供的模型降级（fallback）功能，能够在主 LLM 服务不可用时，自动切换到备选的 LLM 服务，确保业务连续性和用户体验不受影响。

接下来，我们将以通义千问作为主 LLM 服务，DeepSeek 作为备 LLM 服务进行演示。在 `AI 路由管理界面`中，选择通义千问预设的 AI 路由（aliyun），并启用降级配置。在降级服务选项中选择 `deepseek`，同时将目标模型设置为 `deepseek-chat`。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502222050574.png)

在 `AI 服务提供者管理` 界面中，编辑通义千问的凭证（ApiToken），这里我们故意设置一个错误的凭证，以确保能够触发降级功能。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502172209381.png)

接下来，客户端向 Higress AI 网关发送请求，其中 `model` 设置为 `qwen-turbo`。以 `qwen-` 开头的模型将首先通过 AI 路由转发至通义千问。

```bash
# 请求通义千问
curl 'http://localhost:8080/v1/chat/completions' \
      -H 'Content-Type: application/json' \
      -d '{
        "model": "qwen-turbo",
        "messages": [
          {
            "role": "user",
            "content": "你是谁？"
          }
        ]
      }'
```

从响应内容可以看出，这个请求最终是由 DeepSeek 处理的，说明我们设置的模型降级功能已经生效。

```bash
# 响应内容来自 DeepSeek
{
  "id": "99ad1eed-2445-4722-a1e7-d9a9fb2a3b74",
  "object": "chat.completion",
  "created": 1739801515,
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "您好！我是由中国的深度求索（DeepSeek）公司开发的智能助手DeepSeek-V3。如您有任何任何问题，我会尽我所能为您提供帮助。"
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 37,
    "total_tokens": 42,
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 5
  },
  "system_fingerprint": "fp_3a5770e1b4"
}
```

## 令牌降级

除了模型降级功能，Higress AI 网关还提供了令牌降级功能。用户可以设置多个 ApiToken，Higress 默认会随机选择一个进行请求。如果某个 ApiToken 不可用，Higress 会将其从列表中移除，并在后台进行健康检查。一旦该令牌通过检查并恢复正常，它将被重新加入可用列表。这一机制进一步保障了服务的连续性，并确保了用户的良好体验。

在 `AI 服务提供者管理` 界面中，为通义千问模型启用令牌降级功能，将健康检测请求的模型设置为 `qwen-turbo`，其他参数保持默认不变。另外在凭证中分别设置一个可用的 ApiToken 和一个不可用的 ApiToken。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502172155470.png)

接下来，客户端通过 Higress AI 网关向通义千问发送请求，可以多次尝试，你会发现始终能够收到来自通义千问的成功响应。

```bash
# 请求通义千问
curl 'http://localhost:8080/v1/chat/completions' \
      -H 'Content-Type: application/json' \
      -d '{
        "model": "qwen-turbo",
        "messages": [
          {
            "role": "user",
            "content": "你是谁？"
          }
        ]
      }'

# 响应内容来自通义千问
{
  "id": "09257759-00f2-9130-bfbb-799d2b430390",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "我是阿里云开发的一款超大规模语言模型，我叫通义千问。"
      },
      "finish_reason": "stop"
    }
  ],
  "created": 1739801612,
  "model": "qwen-turbo",
  "object": "chat.completion",
  "usage": {
    "prompt_tokens": 11,
    "completion_tokens": 17,
    "total_tokens": 28
  }
}
```

由于`令牌不可用时需要满足的最小连续请求失败次数参数`默认设置为 1，如果首次请求时正好使用了不可用的 ApiToken，Higress 会立即将其从可用列表中移除。同时，默认情况下，Higress 会主动发起一次新的尝试。由于不可用的 ApiToken 已被移除，新的尝试将使用另一个可用的 ApiToken，因此无论尝试多少次，你始终可以收到成功的响应。

此外，令牌降级功能还可以与模型降级功能配合使用。例如，配置多个 ApiToken，当请求失败时，首先尝试使用另一个 ApiToken，如果仍然失败，再降级到备用 LLM，从而进一步提高系统的稳定性和可靠性。

## 总结

本文重点介绍了 Higress AI 网关的模型降级和令牌降级功能。在 LLM 服务不可用时，模型降级功能能自动切换到备用 LLM，确保业务连续性。而令牌降级功能则通过健康检查机制，自动移除不可用的 ApiToken，并在恢复后重新加入，从而提升服务的稳定性和用户体验。
