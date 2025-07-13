---
title: Dynamo 介绍与使用
author: Se7en
date: 2025/06/26 10:00
categories:
 - AI
tags:
 - AI
 - Inference
---

# Dynamo 介绍与使用

## 安装

```bash
# 安装 uv，管理 python 虚拟环境
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# 安装 GPU Driver
wget https://cn.download.nvidia.com/tesla/565.57.01/NVIDIA-Linux-x86_64-565.57.01.run
sh NVIDIA-Linux-x86_64-565.57.01.run --silent

# 安装 CUDA Toolkit（如 nvcc、include、lib64）
sudo apt update
sudo apt install -y nvidia-cuda-toolkit

# 安装 Docker
snap install docker 

# 创建 python 虚拟环境
uv venv dynamo-demo --python 3.12 --seed
source dynamo-demo/bin/activate

# 安装 Dynamo 所需的依赖
DEBIAN_FRONTEND=noninteractive apt-get install -yq python3-dev python3-pip python3-venv libucx0

# 安装 Dynamo
uv pip install "ai-dynamo[all]"
```

## 启动 Etcd 和 Nats

```bash
docker compose up -d
```

```yaml
services:
  nats-server:
    image: nats
    command: [ "-js", "--trace" ]
    ports:
      - 4222:4222
      - 6222:6222
      - 8222:8222

  etcd-server:
    image: bitnami/etcd
    environment:
      - ALLOW_NONE_AUTHENTICATION=yes
    ports:
      - 2379:2379
      - 2380:2380
```

