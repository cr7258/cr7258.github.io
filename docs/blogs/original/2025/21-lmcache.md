---
title: LMCache
author: Se7en
date: 2025/09/30 12:00
categories:
 - AI
tags:
 - AI
 - Inference
---

# LMCache

## 安装 LMCache

### 前提条件

- 操作系统: Linux
- Python: 3.9 – 3.13
- GPU: NVIDIA compute capability 7.0+ (例如 V100, T4, RTX20xx, A100, L4, H100, B200)
- CUDA 12.1+
- [uv (Python 包管理器)](https://docs.astral.sh/uv/getting-started/installation/)

### 安装

```bash
wget https://developer.download.nvidia.com/compute/cuda/13.0.1/local_installers/cuda_13.0.1_580.82.07_linux.run
sudo sh cuda_13.0.1_580.82.07_linux.run
```

```bash
echo 'export PATH=/usr/local/cuda-13.0/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda-13.0/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

```bash
sudo apt-get install -y python3.12-dev build-essential
```

```bash
uv venv --python 3.12
source .venv/bin/activate
uv pip install lmcache vllm
```

### 快速开始

```bash
# The chunk size here is only for illustration purpose, use default one (256) later
LMCACHE_CHUNK_SIZE=8 \
vllm serve Qwen/Qwen3-1.7B \
    --port 8000 --kv-transfer-config \
    '{"kv_connector":"LMCacheConnectorV1", "kv_role":"kv_both"}'
```


```bash
curl http://localhost:8000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen3-1.7B",
    "prompt": "Qwen3 is the latest generation of large language models in Qwen series, offering a comprehensive suite of dense and mixture-of-experts",
    "max_tokens": 100,
    "temperature": 0.7
  }'
```

```bash
(EngineCore_DP0 pid=50662) [2025-10-04 14:19:08,269] LMCache INFO: Reqid: cmpl-7739713b3dcb42ac82a1f53ad4756633-0, Total tokens 27, LMCache hit tokens: 0, need to load: 0 (vllm_v1_adapter.py:1191:lmcache.integration.vllm.vllm_v1_adapter)
(EngineCore_DP0 pid=50662) [2025-10-04 14:19:08,383] LMCache INFO: Post-initializing LMCacheEngine (cache_engine.py:170:lmcache.v1.cache_engine)
(EngineCore_DP0 pid=50662) [2025-10-04 14:19:08,390] LMCache INFO: Storing KV cache for 27 out of 27 tokens (skip_leading_tokens=0) for request cmpl-7739713b3dcb42ac82a1f53ad4756633-0 (vllm_v1_adapter.py:1075:lmcache.integration.vllm.vllm_v1_adapter)
(EngineCore_DP0 pid=50662) [2025-10-04 14:19:08,392] LMCache INFO: Stored 27 out of total 27 tokens. size: 0.0029 gb, cost 1.0917 ms, throughput: 2.6416 GB/s; offload_time: 1.0628 ms, put_time: 0.0289 ms (cache_engine.py:288:lmcache.v1.cache_engine)
(APIServer pid=50477) INFO:     127.0.0.1:60542 - "POST /v1/completions HTTP/1.1" 200 OK
(APIServer pid=50477) INFO 10-04 14:19:11 [loggers.py:127] Engine 000: Avg prompt throughput: 2.7 tokens/s, Avg generation throughput: 10.0 tokens/s, Running: 0 reqs, Waiting: 0 reqs, GPU KV cache usage: 0.0%, Prefix cache hit rate: 0.0%
(APIServer pid=50477) INFO 10-04 14:19:21 [loggers.py:127] Engine 000: Avg prompt throughput: 0.0 tokens/s, Avg generation throughput: 0.0 tokens/s, Running: 0 reqs, Waiting: 0 reqs, GPU KV cache usage: 0.0%, Prefix cache hit rate: 0.0%
```

第二次请求

```bash
(EngineCore_DP0 pid=50662) [2025-10-04 14:20:15,574] LMCache INFO: Reqid: cmpl-7a5b01d2542146b0a42786a5c9859166-0, Total tokens 27, LMCache hit tokens: 27, need to load: 10 (vllm_v1_adapter.py:1191:lmcache.integration.vllm.vllm_v1_adapter)
(EngineCore_DP0 pid=50662) [2025-10-04 14:20:15,686] LMCache INFO: Retrieved 11 out of 11 required tokens (from 27 total tokens). size: 0.0012 gb, cost 0.4396 ms, throughput: 2.6727 GB/s; (cache_engine.py:509:lmcache.v1.cache_engine)
(APIServer pid=50477) INFO:     127.0.0.1:54650 - "POST /v1/completions HTTP/1.1" 200 OK
(APIServer pid=50477) INFO 10-04 14:20:21 [loggers.py:127] Engine 000: Avg prompt throughput: 2.7 tokens/s, Avg generation throughput: 10.0 tokens/s, Running: 0 reqs, Waiting: 0 reqs, GPU KV cache usage: 0.0%, Prefix cache hit rate: 29.6%
(APIServer pid=50477) INFO 10-04 14:20:31 [loggers.py:127] Engine 000: Avg prompt throughput: 0.0 tokens/s, Avg generation throughput: 0.0 tokens/s, Running: 0 reqs, Waiting: 0 reqs, GPU KV cache usage: 0.0%, Prefix cache hit rate: 29.6%
```