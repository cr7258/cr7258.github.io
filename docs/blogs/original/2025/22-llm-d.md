---
title: llm-d
author: Se7en
date: 2025/09/30 12:00
categories:
 - AI
tags:
 - AI
 - Inference
---

# llm-d

Configure and deploy your Gateway control plane.

https://github.com/llm-d/llm-d/blob/main/guides/prereq/gateway-provider/README.md

```bash
./install-gateway-provider-dependencies.sh
```

```bash
helmfile apply -f kgateway.helmfile.yaml
```

## 创建 HuggingFace Token

```bash
export NAMESPACE=llm-d-inference-scheduler
kubectl create namespace ${NAMESPACE}

# Replace <YOUR_HF_TOKEN> with your Huggingface token
export HF_TOKEN=<YOUR_HF_TOKEN>
export HF_TOKEN_NAME=${HF_TOKEN_NAME:-llm-d-hf-token}
kubectl create secret generic ${HF_TOKEN_NAME} \
    --from-literal="HF_TOKEN=${HF_TOKEN}" \
    --namespace "${NAMESPACE}" \
    --dry-run=client -o yaml | kubectl apply -f -
```

## 安装监控组件

https://github.com/llm-d/llm-d/blob/main/docs/monitoring/prometheus-grafana-stack.md

```bash
./scripts/install-prometheus-grafana.sh
```

## 安装 llm-d

```bash
export NAMESPACE=llm-d-inference-scheduler # or any other namespace
cd guides/inference-scheduling
helmfile apply -e kgateway -n ${NAMESPACE}
```

安装 HTTPRoute

```bash
kubectl apply -f httproute.yaml -n ${NAMESPACE}
```



```bash
export NAMESPACE=llm-d-inference-scheduler 
export DECODE_PODS=$(kubectl get pods --no-headers -n ${NAMESPACE} -l "llm-d.ai/role=decode" -o custom-columns=":metadata.name")
stern -n ${NAMESPACE} "$(echo "$DECODE_PODS" | paste -sd'|' -)"
```