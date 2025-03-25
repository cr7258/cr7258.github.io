---
title: 一键部署 GPU Kind 集群，体验 vLLM 极速推理
author: Se7en
date: 2025/03/22 11:30
categories:
 - GPU
tags:
 - GPU
---

# 一键部署 GPU Kind 集群，体验 vLLM 极速推理

随着 Kubernetes 在大模型训练和推理领域的广泛应用，越来越多的开发者需要在本地环境中搭建支持 GPU 的 Kubernetes 集群，以便进行测试和开发。大家都知道，本地搭建 Kubernetes 集群通常可以使用 [Kind（Kubernetes IN Docker）](https://kind.sigs.k8s.io/)，它轻量、快速且易于使用。但是，如果要搭建一个可以使用 GPU 的 Kind 集群，就需要进行一些额外的工作。比如，需要安装 GPU 驱动、配置 NVIDIA Container Toolkit、设置 NVIDIA Container Runtime 等等。此外，如果你希望在多个 Kind 节点之间均匀分配 GPU 资源，模拟一个多节点的 Kind GPU 集群，传统的 Kind 配置可能无法满足需求。

在这篇博客中，我们将介绍如何使用一键脚本快速搭建一个支持 GPU 的 Kind 集群。通过 [nvkind](https://github.com/NVIDIA/nvkind)，我们可以轻松地将 GPU 资源均匀分配到不同的 Kind 节点，从而模拟一个多节点的 Kind GPU 集群。
最后我们还会在 Kind 集群中部署一个 vLLM 大模型，来验证 Kind GPU 集群是否正常工作。

## 前提条件

完整的脚本可以在这里找到：https://github.com/cr7258/hands-on-lab/tree/main/ai/gpu/setup ，该脚本基于 Ubuntu 操作系统编写。

- 具有 NVIDIA GPU 的机器
- 管理员权限（sudo 访问权限）
- 稳定的互联网连接

如果你在本地没有 GPU 服务器，也可以考虑在云服务提供商购买，比如阿里云、AWS、Azure 等。我个人觉得在阿里云上购买 GPU 实例的价格相对更实惠，不同地域的价格也有所差异，例如美国区域通常会更便宜一些。如果选择抢占式实例，价格还能进一步降低，非常适合用于开发测试等对稳定性要求不高的场景。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202503221849487.png)

此外，阿里云的 ECS 实例在不使用时可以开启“节省停机”功能，这样可以保留磁盘数据，方便下次继续使用，同时还能节省 CPU、内存、GPU 等计算资源的费用。考虑到大模型通常占用较大的存储空间，建议在创建实例时将存储空间配置得稍微大一些，比如 100GB，以避免频繁扩容带来的麻烦。


## 执行脚本

只需执行以下命令，脚本会自动完成所有准备工作并创建一个支持 GPU 的 Kind 集群。

```bash
bash install.sh
```

## 脚本详解

接下来分别介绍脚本中的各个部分。

### 安装命令行工具

首先安装一些必要的命令行工具，包括 Docker、kubectl、Helm、Kind 和 nvkind。

```bash
sudo apt update
sudo apt install -y docker.io
sudo snap install kubectl --classic
# Add kubectl completion to bashrc
echo 'source <(kubectl completion bash)' >> ~/.bashrc
source ~/.bashrc
sudo snap install helm --classic

# Install kind
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.25.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Install nvkind
curl -L -o ~/nvkind-linux-amd64.tar.gz https://github.com/Jeffwan/kind-with-gpus-examples/releases/download/v0.1.0/nvkind-linux-amd64.tar.gz
tar -xzvf ~/nvkind-linux-amd64.tar.gz
mv nvkind-linux-amd64 /usr/local/bin/nvkind
```

### 安装 NVIDIA GPU 驱动程序

为了使用 GPU，我们需要安装 NVIDIA 驱动程序，这里使用的是 NVIDIA 驱动程序版本是 565.57.01。

```bash
wget https://cn.download.nvidia.com/tesla/565.57.01/NVIDIA-Linux-x86_64-565.57.01.run
sh NVIDIA-Linux-x86_64-565.57.01.run --silent
```

### 安装和配置 NVIDIA Container Toolkit

[NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/index.html#) 的主要作用是将 NVIDIA GPU 设备挂载到容器中。

```bash
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sed -i -e '/experimental/ s/^#//g' /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
```

然后配置 NVIDIA Container Runtime：

- 第一条命令用于确保 Docker 已正确配置以配合 NVIDIA Toolkit 使用，并将 `nvidia` runtime 设置为默认值。
- 第二条命令启用了 Toolkit 的一个功能标志，借助这一特性，我们可以将 GPU 支持注入到每个 Kind 的 worker 节点中。

```bash
sudo nvidia-ctk runtime configure --runtime=docker --set-as-default --cdi.enabled
sudo nvidia-ctk config --set accept-nvidia-visible-devices-as-volume-mounts=true --in-place
sudo systemctl restart docker
```

### 验证 GPU 可用性

通过多种方式验证 GPU 是否可用：

- 运行 `nvidia-smi` 以检查 GPU 是否可用。
- 使用 NVIDIA runtime 运行一个 Docker 容器，验证是否能识别 GPU。
- 确保容器内能够访问 GPU 设备。

```bash
# Run nvidia-smi to list GPU devices
nvidia-smi -L
if [ $? -ne 0 ]; then
    echo "nvidia-smi failed to execute."
    exit 1
fi

# Run a Docker container with NVIDIA runtime to list GPU devices
docker run --runtime=nvidia -e NVIDIA_VISIBLE_DEVICES=all ubuntu:20.04 nvidia-smi -L
if [ $? -ne 0 ]; then
    echo "Docker command with NVIDIA runtime failed to execute."
    exit 1
fi

# Run a Docker container with mounted /dev/null to check GPU accessibility
docker run -v /dev/null:/var/run/nvidia-container-devices/all ubuntu:20.04 nvidia-smi -L
if [ $? -ne 0 ]; then
    echo "Docker command with mounted /dev/null failed to execute."
    exit 1
fi
```

### 创建 Kind GPU 集群

首先生成一个 nvkind 配置文件，根据服务器上的 GPU 数量创建对应数量的 worker 节点，然后执行 nvkind 命令创建支持 GPU 的 Kind 集群。

```bash
cat << 'EOF' > one-worker-per-gpu.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
{{- range $gpu := until numGPUs }}
- role: worker
  extraMounts:
    # We inject all NVIDIA GPUs using the nvidia-container-runtime.
    # This requires `accept-nvidia-visible-devices-as-volume-mounts = true` be set
    # in `/etc/nvidia-container-runtime/config.toml`
    - hostPath: /dev/null
      containerPath: /var/run/nvidia-container-devices/{{ $gpu }}
{{- end }}
EOF

nvkind cluster create --name gpu-cluster --config-template=one-worker-per-gpu.yaml
```

### 安装 GPU Operator

[GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) 是 NVIDIA 提供的一个 Kubernetes Operator，它简化了在 Kubernetes 集群中使用 GPU 的过程，通过自动化的方式处理 GPU 驱动程序安装、[NVIDIA Device Plugin](https://github.com/NVIDIA/k8s-device-plugin)、[DCGM Exporter](https://github.com/NVIDIA/dcgm-exporter) 等组件。

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
helm install --wait --generate-name \
     -n gpu-operator --create-namespace \
     nvidia/gpu-operator \
     # 我们之前已经安装了 NVIDIA 驱动程序，所以在 GPU Operator 中禁用驱动安装
     --set driver.enabled=false
```

### 安装 Cloud Provider Kind

最后脚本安装了 [Cloud Provider Kind](https://github.com/kubernetes-sigs/cloud-provider-kind)，允许以 LoadBalancer 的模式暴露服务，方便从 Kind 集群外部进行访问。

```bash
curl -L ${KIND_CLOUD_PROVIDER_URL} -o cloud-provider-kind.tar.gz
tar -xvzf cloud-provider-kind.tar.gz
chmod +x cloud-provider-kind
sudo mv cloud-provider-kind /usr/local/bin/

# Run cloud-provider-kind in the background and forward logs
echo "Starting cloud-provider-kind in the background..."
LOG_FILE="/tmp/cloud-provider-kind.log"

nohup cloud-provider-kind > ${LOG_FILE} 2>&1 &

# Save the process ID
echo $! > /tmp/cloud-provider-kind.pid
echo "Cloud Provider Kind is running in the background. Logs are being written to ${LOG_FILE}."

echo "Setup complete. All components have been installed successfully."
```

## 通过 vLLM 运行大模型

接下来我们通过 vLLM 来运行 `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` 模型来测试 Kind GPU 集群是否正常工作。[vLLM](https://docs.vllm.ai/en/stable/index.html) 是一个快速且易于使用的库，用于 LLM 推理和服务，可以和 HuggingFace 无缝集成。

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: deepseek-r1-distill-qwen-1-5b
  namespace: default
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
  volumeMode: Filesystem
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deepseek-r1-distill-qwen-1-5b
  namespace: default
  labels:
    app: deepseek-r1-distill-qwen-1-5b
spec:
  replicas: 1
  selector:
    matchLabels:
      app: deepseek-r1-distill-qwen-1-5b
  template:
    metadata:
      labels:
        app: deepseek-r1-distill-qwen-1-5b
    spec:
      volumes:
        - name: cache-volume
          persistentVolumeClaim:
            claimName: deepseek-r1-distill-qwen-1-5b
      containers:
      - name: deepseek-r1-distill-qwen-1-5b
        image: vllm/vllm-openai:latest
        command: ["/bin/sh", "-c"]
        args: [
          "vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --trust-remote-code --enable-chunked-prefill --max_num_batched_tokens 1024"
        ]
        ports:
        - containerPort: 8000
        resources:
          limits:
            nvidia.com/gpu: "1"
          requests:
            nvidia.com/gpu: "1"
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 60
          periodSeconds: 5
        volumeMounts:
          - mountPath: /root/.cache/huggingface
            name: cache-volume
---
apiVersion: v1
kind: Service
metadata:
  name: deepseek-r1-distill-qwen-1-5b
  namespace: default
spec:
  ports:
  - name: deepseek-r1-distill-qwen-1-5b
    port: 80
    protocol: TCP
    targetPort: 8000
  selector:
    app: deepseek-r1-distill-qwen-1-5b
  type: LoadBalancer
```

[vllm/vllm-openai:latest](https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-efffca1208454f9f8cfab0b4bf9dbdfa7e78ecdfe8a45f9efc1ee5c703397eeb) 的镜像大概有 8GB，需要一些时间来下载，另外 vLLM 启动以后还需要去 HuggingFace 下载模型权重。首次启动 Pod 时，下载模型权重花费了 508 秒。由于模型权重被缓存在 PVC 中，并挂载到 `/root/.cache/huggingface` 目录，后续 Pod 重启时将无需重新下载权重，能够显著加快启动速度。

```bash
> kubectl logs deepseek-r1-distill-qwen-1-5b-66dc67d4dc-86b2v -f
INFO 03-22 12:14:52 [__init__.py:256] Automatically detected platform cuda.
INFO 03-22 12:14:56 [api_server.py:977] vLLM API server version 0.8.1
INFO 03-22 12:14:56 [api_server.py:978] args: Namespace(subparser='serve', model_tag='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', config='', host=None, port=8000, uvicorn_log_level='info', allow_credentials=False, allowed_origins=['*'], allowed_methods=['*'], allowed_headers=['*'], api_key=None, lora_modules=None, prompt_adapters=None, chat_template=None, chat_template_content_format='auto', response_role='assistant', ssl_keyfile=None, ssl_certfile=None, ssl_ca_certs=None, enable_ssl_refresh=False, ssl_cert_reqs=0, root_path=None, middleware=[], return_tokens_as_token_ids=False, disable_frontend_multiprocessing=False, enable_request_id_headers=False, enable_auto_tool_choice=False, tool_call_parser=None, tool_parser_plugin='', model='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', task='auto', tokenizer=None, hf_config_path=None, skip_tokenizer_init=False, revision=None, code_revision=None, tokenizer_revision=None, tokenizer_mode='auto', trust_remote_code=True, allowed_local_media_path=None, download_dir=None, load_format='auto', config_format=<ConfigFormat.AUTO: 'auto'>, dtype='auto', kv_cache_dtype='auto', max_model_len=None, guided_decoding_backend='xgrammar', logits_processor_pattern=None, model_impl='auto', distributed_executor_backend=None, pipeline_parallel_size=1, tensor_parallel_size=1, enable_expert_parallel=False, max_parallel_loading_workers=None, ray_workers_use_nsight=False, block_size=None, enable_prefix_caching=None, disable_sliding_window=False, use_v2_block_manager=True, num_lookahead_slots=0, seed=None, swap_space=4, cpu_offload_gb=0, gpu_memory_utilization=0.9, num_gpu_blocks_override=None, max_num_batched_tokens=1024, max_num_partial_prefills=1, max_long_partial_prefills=1, long_prefill_token_threshold=0, max_num_seqs=None, max_logprobs=20, disable_log_stats=False, quantization=None, rope_scaling=None, rope_theta=None, hf_overrides=None, enforce_eager=False, max_seq_len_to_capture=8192, disable_custom_all_reduce=False, tokenizer_pool_size=0, tokenizer_pool_type='ray', tokenizer_pool_extra_config=None, limit_mm_per_prompt=None, mm_processor_kwargs=None, disable_mm_preprocessor_cache=False, enable_lora=False, enable_lora_bias=False, max_loras=1, max_lora_rank=16, lora_extra_vocab_size=256, lora_dtype='auto', long_lora_scaling_factors=None, max_cpu_loras=None, fully_sharded_loras=False, enable_prompt_adapter=False, max_prompt_adapters=1, max_prompt_adapter_token=0, device='auto', num_scheduler_steps=1, use_tqdm_on_load=True, multi_step_stream_outputs=True, scheduler_delay_factor=0.0, enable_chunked_prefill=True, speculative_model=None, speculative_model_quantization=None, num_speculative_tokens=None, speculative_disable_mqa_scorer=False, speculative_draft_tensor_parallel_size=None, speculative_max_model_len=None, speculative_disable_by_batch_size=None, ngram_prompt_lookup_max=None, ngram_prompt_lookup_min=None, spec_decoding_acceptance_method='rejection_sampler', typical_acceptance_sampler_posterior_threshold=None, typical_acceptance_sampler_posterior_alpha=None, disable_logprobs_during_spec_decoding=None, model_loader_extra_config=None, ignore_patterns=[], preemption_mode=None, served_model_name=None, qlora_adapter_name_or_path=None, show_hidden_metrics_for_version=None, otlp_traces_endpoint=None, collect_detailed_traces=None, disable_async_output_proc=False, scheduling_policy='fcfs', scheduler_cls='vllm.core.scheduler.Scheduler', override_neuron_config=None, override_pooler_config=None, compilation_config=None, kv_transfer_config=None, worker_cls='auto', worker_extension_cls='', generation_config='auto', override_generation_config=None, enable_sleep_mode=False, calculate_kv_scales=False, additional_config=None, enable_reasoning=False, reasoning_parser=None, disable_log_requests=False, max_log_len=None, disable_fastapi_docs=False, enable_prompt_tokens_details=False, enable_server_load_tracking=False, dispatch_function=<function ServeSubcommand.cmd at 0x701e1ce19a80>)
INFO 03-22 12:15:09 [config.py:583] This model supports multiple tasks: {'score', 'embed', 'reward', 'generate', 'classify'}. Defaulting to 'generate'.
INFO 03-22 12:15:09 [config.py:1693] Chunked prefill is enabled with max_num_batched_tokens=1024.
INFO 03-22 12:15:16 [__init__.py:256] Automatically detected platform cuda.
INFO 03-22 12:15:18 [core.py:53] Initializing a V1 LLM engine (v0.8.1) with config: model='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', speculative_config=None, tokenizer='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', skip_tokenizer_init=False, tokenizer_mode=auto, revision=None, override_neuron_config=None, tokenizer_revision=None, trust_remote_code=True, dtype=torch.bfloat16, max_seq_len=131072, download_dir=None, load_format=LoadFormat.AUTO, tensor_parallel_size=1, pipeline_parallel_size=1, disable_custom_all_reduce=False, quantization=None, enforce_eager=False, kv_cache_dtype=auto,  device_config=cuda, decoding_config=DecodingConfig(guided_decoding_backend='xgrammar', reasoning_backend=None), observability_config=ObservabilityConfig(show_hidden_metrics=False, otlp_traces_endpoint=None, collect_model_forward_time=False, collect_model_execute_time=False), seed=None, served_model_name=deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, num_scheduler_steps=1, multi_step_stream_outputs=True, enable_prefix_caching=True, chunked_prefill_enabled=True, use_async_output_proc=True, disable_mm_preprocessor_cache=False, mm_processor_kwargs=None, pooler_config=None, compilation_config={"level":3,"custom_ops":["none"],"splitting_ops":["vllm.unified_attention","vllm.unified_attention_with_output"],"use_inductor":true,"compile_sizes":[],"use_cudagraph":true,"cudagraph_num_of_warmups":1,"cudagraph_capture_sizes":[512,504,496,488,480,472,464,456,448,440,432,424,416,408,400,392,384,376,368,360,352,344,336,328,320,312,304,296,288,280,272,264,256,248,240,232,224,216,208,200,192,184,176,168,160,152,144,136,128,120,112,104,96,88,80,72,64,56,48,40,32,24,16,8,4,2,1],"max_capture_size":512}
WARNING 03-22 12:15:20 [utils.py:2282] Methods determine_num_available_blocks,device_config,get_cache_block_size_bytes,initialize_cache not implemented in <vllm.v1.worker.gpu_worker.Worker object at 0x741a9f769130>
INFO 03-22 12:15:20 [parallel_state.py:967] rank 0 in world size 1 is assigned as DP rank 0, PP rank 0, TP rank 0
INFO 03-22 12:15:20 [cuda.py:215] Using Flash Attention backend on V1 engine.
INFO 03-22 12:15:20 [gpu_model_runner.py:1164] Starting to load model deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B...
INFO 03-22 12:15:21 [topk_topp_sampler.py:53] Using FlashInfer for top-p & top-k sampling.
INFO 03-22 12:15:21 [weight_utils.py:257] Using model weights format ['*.safetensors']

# 下载模型权重花费 508 秒
INFO 03-22 12:23:49 [weight_utils.py:273] Time spent downloading weights for deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B: 508.576789 seconds
INFO 03-22 12:23:49 [weight_utils.py:307] No model.safetensors.index.json found in remote.
Loading safetensors checkpoint shards:   0% Completed | 0/1 [00:00<?, ?it/s]
Loading safetensors checkpoint shards: 100% Completed | 1/1 [00:00<00:00,  2.02it/s]
Loading safetensors checkpoint shards: 100% Completed | 1/1 [00:00<00:00,  2.02it/s]

INFO 03-22 12:23:50 [loader.py:429] Loading weights took 0.56 seconds
INFO 03-22 12:23:50 [gpu_model_runner.py:1176] Model loading took 3.3465 GB and 509.679959 seconds
INFO 03-22 12:23:56 [backends.py:409] Using cache directory: /root/.cache/vllm/torch_compile_cache/b4fe10a8ad/rank_0_0 for vLLM's torch.compile
INFO 03-22 12:23:56 [backends.py:419] Dynamo bytecode transform time: 6.04 s
INFO 03-22 12:23:59 [backends.py:132] Cache the graph of shape None for later use
INFO 03-22 12:24:19 [backends.py:144] Compiling a graph for general shape takes 22.07 s
INFO 03-22 12:24:27 [monitor.py:33] torch.compile takes 28.11 s in total
INFO 03-22 12:24:28 [kv_cache_utils.py:537] GPU KV cache size: 525,520 tokens
INFO 03-22 12:24:28 [kv_cache_utils.py:540] Maximum concurrency for 131,072 tokens per request: 4.01x
INFO 03-22 12:24:49 [gpu_model_runner.py:1499] Graph capturing finished in 21 secs, took 0.45 GiB
INFO 03-22 12:24:50 [core.py:138] init engine (profile, create kv cache, warmup model) took 59.57 seconds
INFO 03-22 12:24:50 [serving_chat.py:115] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 03-22 12:24:50 [serving_completion.py:61] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 03-22 12:24:50 [api_server.py:1024] Starting vLLM API server on http://0.0.0.0:8000
INFO 03-22 12:24:50 [launcher.py:26] Available routes are:
INFO 03-22 12:24:50 [launcher.py:34] Route: /openapi.json, Methods: GET, HEAD
INFO 03-22 12:24:50 [launcher.py:34] Route: /docs, Methods: GET, HEAD
INFO 03-22 12:24:50 [launcher.py:34] Route: /docs/oauth2-redirect, Methods: GET, HEAD
INFO 03-22 12:24:50 [launcher.py:34] Route: /redoc, Methods: GET, HEAD
INFO 03-22 12:24:50 [launcher.py:34] Route: /health, Methods: GET
INFO 03-22 12:24:50 [launcher.py:34] Route: /load, Methods: GET
INFO 03-22 12:24:50 [launcher.py:34] Route: /ping, Methods: GET, POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /tokenize, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /detokenize, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/models, Methods: GET
INFO 03-22 12:24:50 [launcher.py:34] Route: /version, Methods: GET
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/chat/completions, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/completions, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/embeddings, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /pooling, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /score, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/score, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/audio/transcriptions, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /rerank, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v1/rerank, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /v2/rerank, Methods: POST
INFO 03-22 12:24:50 [launcher.py:34] Route: /invocations, Methods: POST
INFO:     Started server process [7]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

确认 Pod 状态已经 Ready。

```bash
> kubectl get pod 
NAME                                             READY   STATUS    RESTARTS   AGE
deepseek-r1-distill-qwen-1-5b-66dc67d4dc-86b2v   1/1     Running   0          26m

> kubectl get svc
NAME                            TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
deepseek-r1-distill-qwen-1-5b   LoadBalancer   10.96.11.243   172.18.0.4    80:31629/TCP   26m
```

通过 LoadBalancer 暴露的 EXTERNAL-IP 来访问大模型。

```bash
curl --location 'http://172.18.0.4/v1/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
    "model":"deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
    "messages": [
      {
        "role": "user",
        "content": "你是谁？"
      }
    ]
}'
```

响应结果如下，可以看到大模型成功处理了我们的请求。

```json
{
  "id": "chatcmpl-06fde7b60b5642b5a2100b6146d351fa",
  "object": "chat.completion",
  "created": 1742646615,
  "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "reasoning_content": null,
        "content": "我是DeepSeek-R1，一个由深度求索公司开发的智能助手，我擅长通过思考来帮您解答复杂的数学，代码和逻辑推理等理工类问题。\n</think>\n\n我是DeepSeek-R1，一个由深度求索公司开发的智能助手，我擅长通过思考来帮您解答复杂的数学，代码和逻辑推理等理工类问题。",
        "tool_calls": [
          
        ]
      },
      "logprobs": null,
      "finish_reason": "stop",
      "stop_reason": null
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 85,
    "completion_tokens": 77,
    "prompt_tokens_details": null
  },
  "prompt_logprobs": null
}
```

如果我们重启 Pod，这次会发现加载模型权重仅用了 0.55 秒，说明模型权重已经缓存起来了。

```bash
INFO 03-22 12:51:31 [weight_utils.py:257] Using model weights format ['*.safetensors']
INFO 03-22 12:51:31 [weight_utils.py:307] No model.safetensors.index.json found in remote.
Loading safetensors checkpoint shards:   0% Completed | 0/1 [00:00<?, ?it/s]
Loading safetensors checkpoint shards: 100% Completed | 1/1 [00:00<00:00,  2.06it/s]
Loading safetensors checkpoint shards: 100% Completed | 1/1 [00:00<00:00,  2.06it/s]

INFO 03-22 12:51:31 [loader.py:429] Loading weights took 0.55 seconds
INFO 03-22 12:51:31 [gpu_model_runner.py:1176] Model loading took 3.3465 GB and 0.912167 seconds
INFO 03-22 12:51:37 [backends.py:409] Using cache directory: /root/.cache/vllm/torch_compile_cache/b4fe10a8ad/rank_0_0 for vLLM's torch.compile
INFO 03-22 12:51:37 [backends.py:419] Dynamo bytecode transform time: 5.92 s
INFO 03-22 12:51:40 [backends.py:132] Cache the graph of shape None for later use
INFO 03-22 12:52:00 [backends.py:144] Compiling a graph for general shape takes 22.21 s
INFO 03-22 12:52:09 [monitor.py:33] torch.compile takes 28.13 s in total
INFO 03-22 12:52:10 [kv_cache_utils.py:537] GPU KV cache size: 525,520 tokens
INFO 03-22 12:52:10 [kv_cache_utils.py:540] Maximum concurrency for 131,072 tokens per request: 4.01x
INFO 03-22 12:52:31 [gpu_model_runner.py:1499] Graph capturing finished in 21 secs, took 0.45 GiB
INFO 03-22 12:52:31 [core.py:138] init engine (profile, create kv cache, warmup model) took 59.32 seconds
INFO 03-22 12:52:31 [serving_chat.py:115] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 03-22 12:52:31 [serving_completion.py:61] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 03-22 12:52:31 [api_server.py:1024] Starting vLLM API server on http://0.0.0.0:8000
```

## 清理

完成测试后，如果你想删除集群，可以执行以下命令：

```bash
bash cleanup.sh
```

## 总结

本文介绍了如何通过一键脚本在本地快速搭建支持 GPU 的 Kind 集群，适用于大模型的开发与测试场景。利用 nvkind 工具，可以轻松实现多节点 GPU 资源分配，并结合 vLLM 成功部署了 `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` 模型。
