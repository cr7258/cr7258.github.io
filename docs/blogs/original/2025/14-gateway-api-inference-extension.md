---
title: 为 Kubernetes 提供智能的 LLM 推理路由：Gateway API Inference Extension 深度解析
author: Se7en
date: 2025/04/06 22:30
categories:
 - AI
tags:
 - AI
 - Gateway
 - Inference
---

# 为 Kubernetes 提供智能的 LLM 推理路由：Gateway API Inference Extension 深度解析

现代生成式 AI 和大语言模型（LLM）服务给 Kubernetes 带来了独特的流量路由挑战。与典型的短时、无状态 Web 请求不同，LLM 推理会话通常是长时运行、资源密集且部分有状态的。例如，一个基于 GPU 的模型服务器可能同时维护多个活跃的推理会话，并维护内存中的 token 缓存。

传统的负载均衡器多基于 HTTP 路径或轮询调度，缺乏处理此类工作负载所需的专业能力。这些方案无法识别模型标识或请求的重要性（例如交互式对话请求与批处理作业之间的区别）。企业往往采用临时拼凑的方式应对，但缺乏统一标准的解决方案。

为了解决这一问题，[Gateway API Inference Extension](https://gateway-api-inference-extension.sigs.k8s.io/) 在现有 [Gateway API](https://gateway-api.sigs.k8s.io/) 的基础上，添加了针对推理任务的专属路由能力，同时保留了 Gateways 和 HTTPRoutes 的熟悉模型。通过为现有网关添加这一扩展，可以将其转变为“推理网关”（Inference Gateway），帮助用户以“模型即服务”的方式自托管生成式 AI 模型或 LLM。

该扩展可将支持 [ext-proc](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter) 的代理或网关（如 Envoy Gateway、kGateway 或 GKE Gateway）升级为推理网关，支持推理平台团队在 Kubernetes 上自建大语言模型服务。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202504101028179.png)

## 主要特性

Gateway API Inference Extension 及其在 Envoy Proxy 中的参考实现提供了以下关键特性：

- **模型感知路由**：与传统仅基于请求路径进行路由的方式不同，Gateway API Inference Extension 支持根据模型名称进行路由。这一能力得益于网关实现（如 Envoy Proxy）对生成式 AI 推理 API 规范（如 OpenAI API）的支持。该模型感知路由能力同样适用于基于 LoRA（Low-Rank Adaptation）微调的模型。
- **服务优先级**：Gateway API Inference Extension 支持为模型指定服务优先级。例如，可为在线对话类任务（对延迟较为敏感）的模型设定更高的 Criticality，而对延迟容忍度更高的任务（如摘要生成）的模型则设定较低的优先级。
- **模型版本发布**：Gateway API Inference Extension 支持基于模型名称进行流量拆分，从而实现模型版本的渐进式发布与灰度上线。
- **推理服务的可扩展性**：Gateway API Inference Extension 定义了一种可扩展模式，允许用户根据自身需求扩展推理服务，实现定制化的路由能力，以应对默认方案无法满足的场景。
- **面向推理的可定制负载均衡**：Gateway API Inference Extension 提供了一种专为推理优化的可定制负载均衡与请求路由模式，并在实现中提供了基于模型服务器实时指标的模型端点选择（model endpoint picking）机制。该机制可替代传统负载均衡方式，被称为“模型服务器感知”的智能负载均衡。实践表明，它能够有效降低推理延迟并提升集群中 GPU 的利用率。

## 核心 CRD

Gateway API Inference Extension 定义了两个核心 CRD：[InferencePool](https://gateway-api-inference-extension.sigs.k8s.io/api-types/inferencepool/) 和 [InferenceModel](https://gateway-api-inference-extension.sigs.k8s.io/api-types/inferencemodel/)。

### InferencePool

InferencePool 表示一组专注于 AI 推理的 Pod，同时定义了用于路由到这些 Pod 的扩展配置。在 Gateway API 的资源模型中，InferencePool 被视为一种 “Backend” 资源。实际上，它可以用来替代传统的 Kubernetes Service，作为下游服务的目标。

虽然 InferencePool 在某些方面与 Service 类似（比如选择 Pod 并指定端口），但它提供了专门面向推理场景的增强能力。InferencePool 通过 `extensionRef` 字段指向一个 EndPoint Picker 来管理推理感知的端点选择，从而根据实时指标（例如请求队列深度和 GPU 内存可用性）做出智能路由决策。

```yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferencePool
metadata:
  labels:
  name: vllm-llama3-8b-instruct
spec:
  targetPortNumber: 8000
  selector: # 选择运行 LLM 服务的 Pod
    app: vllm-llama3-8b-instruct
  extensionRef: # 指向 EndPoint Picker
    name: vllm-llama3-8b-instruct-epp
```

### InferenceModel

InferenceModel 表示某个推理模型或适配器及其相关配置。该资源用于定义模型的重要性等级（criticality），从而支持基于优先级的请求调度。

此外，InferenceModel 还支持将用户请求中的“模型名称”平滑地映射到一个或多个后端实际模型名称，便于进行版本管理、灰度发布或适配不同模型格式。多个 InferenceModel 可以关联到同一个 InferencePool 上，从而构建出一个灵活且可扩展的模型路由体系。

```yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferenceModel
metadata:
  name: food-review
spec:
  modelName: food-review # 用户请求中的模型名称
  criticality: Standard # 模型重要性等级
  poolRef: # 多个 InferenceModel 可以关联到同一个 InferencePool 上
    name: vllm-llama3-8b-instruct
  targetModels: # 指定后端实际模型名称
  - name: food-review-1
    weight: 100
```

## 相关组件

### EndPoint Picker (EPP)

[EndPoint Picker (EPP)](https://github.com/kubernetes-sigs/gateway-api-inference-extension/tree/main/pkg/epp) 是专为 AI 推理场景设计的智能流量调度组件，每个 InferencePool 需独立部署一个 EPP 实例。EPP 实现了 Envoy 的 [ext-proc](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter)，在 Envoy 转发流量之前，它会先通过 gRPC 请求 EPP，EPP 会指示 Envoy 将请求路由到哪个具体的 Pod。

EPP 主要实现以下核心功能：

#### 1. 端点选择

EPP 的首要职责是从 InferencePool 中挑选一个合适的 Pod 作为请求的目标：

- 每个 EPP 实例只服务一个 InferencePool（每个 InferencePool 需部署一个 EPP 实例）。
- 它根据 InferencePool 的 `Selector` 字段，从标记为“就绪”的 Pod 中选择目标。
- 请求中的 `ModelName` 必须匹配绑定该 InferencePool 的某个 `InferenceModel`。
- 若找不到匹配的 `ModelName`，则返回错误响应给网关代理（如 Envoy）。

#### 2. 流量拆分与模型名重写

EPP 支持灰度发布和模型版本管理：

- 通过 `InferenceModel` 中的配置，实现不同模型版本（如 LoRA 适配器）的流量按比例分配。
- 将用户请求中的模型名（`ModelName`）重写为真实后端模型的名称，支持灵活映射。

#### 3. 可观测性

EPP 还负责生成与推理流量相关的监控指标：

- 提供基于 `InferenceModel` 的统计数据。
- 这些指标可以细化到实际使用的后端模型，方便监控和调优。

### Dynamic LORA Adapter Sidecar

[Dynamic LORA Adapter Sidecar](https://github.com/kubernetes-sigs/gateway-api-inference-extension/tree/main/tools/dynamic-lora-sidecar) 是一个基于 sidecar 的工具，用于将新的 LoRA 适配器部署到一组正在运行的 vLLM 模型服务器。用户将 sidecar 与 vLLM 服务器一起部署，并通过 ConfigMap 指定希望配置的 LoRA 适配器。sidecar 监视 ConfigMap，并向 vLLM 容器发送加载或卸载请求，以执行用户的配置意图。

LoRA（Low-Rank Adaptation，低秩自适应）适配器是一种高效微调大模型的技术，它通过在预训练模型的特定层旁添加小型可训练的低秩矩阵，仅更新少量参数即可适配新任务，显著降低计算和存储成本。其核心作用包括：动态加载不同任务适配器实现多任务切换，以及保持原模型权重不变的同时提升微调效率，适用于个性化模型定制和资源受限场景

## 请求流程

为了说明这一切是如何结合在一起的，让我们通过一个请求示例来说明：

1. 客户端向推理网关发送请求。
2. 请求到达推理网关后，网关根据 HTTPRoute 的匹配规则将请求路由到相应的 InferencePool。对于 Envoy 支持的 L7 路由器（如 kgateway 或 Istio），通常会通过路由策略和负载均衡来选择请求的目标端点。
3. 对于 InferencePool，请求会首先发送到一个专门的扩展组件——EndPoint Picker (EPP)。EPP 会根据来自 LLM 本身的指标来选择合适的后端 LLM 端点。
4. 当请求到达 EPP 后，EPP 会从请求正文中提取 modelName。识别出 modelName 后，EPP 会与可用的 InferenceModel 对象的 modelName 字段进行对比，确定相应的后端模型或 LoRA 适配器。例如，若 EPP 检测到的模型名称为 `food-review`，它会找到匹配的 InferenceModel，并将请求路由到适当的端点，如 `food-review-1` 或 `food-review-2`。
5. EPP 定义了一系列过滤器，用于选择特定模型对应的端点。它会定期查询各个 LLM Pod 的相关指标（如队列长度、KV 缓存使用情况等），从而选择最适合处理当前请求的 Pod。
6. EPP 选定最佳 Pod 后，会将其返回给推理网关。
7. 推理网关将请求路由到 EPP 选择的 Pod。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202504101124494.png)


## 实验

### 环境准备

准备一个 GPU Kubernetes 集群，可以参考我之前写的这篇文章快速搭建：[一键部署 GPU Kind 集群，体验 vLLM 极速推理](https://mp.weixin.qq.com/s/TNXrDr59wxcAZF9MhUJGjw)。本实验运行的模型是 `meta-llama/Llama-3.1-8B-Instruct`，对 GPU 的性能有一定要求，我是用 A100 的 GPU 进行实验的。

### 创建 Hugging Face Token

需要先在 [Hugging Face](https://huggingface.co/settings/token) 创建一个 Token，并且申请 [meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B) 模型的使用许可，注意填写信息的时候国家不要选中国，否则会被秒拒。

然后创建一个 Secret，将 Token 存储在其中。

```bash
kubectl create secret generic hf-token --from-literal=token="<your-huggingface-token>"
```

### 部署 vLLM

通过 vLLM 部署推理服务，默认配置为一个副本。如果 GPU 资源充足，可以增加副本数量。同时，配置了 lora-adapter-syncer 作为 sidecar 容器，根据 Configmap 中的配置动态管理 LoRA 适配器的加载与卸载。

```yaml
# 01-gpu-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-llama3-8b-instruct
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm-llama3-8b-instruct
  template:
    metadata:
      labels:
        app: vllm-llama3-8b-instruct
    spec:
      containers:
        - name: vllm
          image: "vllm/vllm-openai:latest"
          imagePullPolicy: Always
          command: ["python3", "-m", "vllm.entrypoints.openai.api_server"]
          args:
          - "--model"
          - "meta-llama/Llama-3.1-8B-Instruct"
          - "--tensor-parallel-size"
          - "1"
          - "--port"
          - "8000"
          - "--max-num-seq"
          - "1024"
          - "--compilation-config"
          - "3"
          - "--enable-lora"
          - "--max-loras"
          - "2"
          - "--max-lora-rank"
          - "8"
          - "--max-cpu-loras"
          - "12"
          env:
            # Enabling LoRA support temporarily disables automatic v1, we want to force it on
            # until 0.8.3 vLLM is released.
            - name: VLLM_USE_V1
              value: "1"
            - name: PORT
              value: "8000"
            - name: HUGGING_FACE_HUB_TOKEN
              valueFrom:
                secretKeyRef:
                  name: hf-token
                  key: token
            - name: VLLM_ALLOW_RUNTIME_LORA_UPDATING
              value: "true"
          ports:
            - containerPort: 8000
              name: http
              protocol: TCP
          lifecycle:
            preStop:
              exec:
               command:
               - /usr/bin/sleep
               - "30"
          livenessProbe:
            httpGet:
              path: /health
              port: http
              scheme: HTTP
            periodSeconds: 1
            successThreshold: 1
            failureThreshold: 5
            timeoutSeconds: 1
          readinessProbe:
            httpGet:
              path: /health
              port: http
              scheme: HTTP
            periodSeconds: 1
            successThreshold: 1
            failureThreshold: 1
            timeoutSeconds: 1
          startupProbe:
            failureThreshold: 600
            initialDelaySeconds: 2
            periodSeconds: 1
            httpGet:
              path: /health
              port: http
              scheme: HTTP
          resources:
            limits:
              nvidia.com/gpu: 1
            requests:
              nvidia.com/gpu: 1
          volumeMounts:
            - mountPath: /data
              name: data
            - mountPath: /dev/shm
              name: shm
            - name: adapters
              mountPath: "/adapters"
      initContainers:
        - name: lora-adapter-syncer
          tty: true
          stdin: true 
          image: us-central1-docker.pkg.dev/k8s-staging-images/gateway-api-inference-extension/lora-syncer:main
          restartPolicy: Always
          imagePullPolicy: Always
          env: 
            - name: DYNAMIC_LORA_ROLLOUT_CONFIG
              value: "/config/configmap.yaml"
          volumeMounts: # DO NOT USE subPath, dynamic configmap updates don't work on subPaths
          - name: config-volume
            mountPath:  /config
      restartPolicy: Always
      enableServiceLinks: false
      terminationGracePeriodSeconds: 130
      volumes:
        - name: data
          emptyDir: {}
        - name: shm
          emptyDir:
            medium: Memory
        - name: adapters
          emptyDir: {}
        - name: config-volume
          configMap:
            name: vllm-llama3-8b-instruct-adapters
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: vllm-llama3-8b-instruct-adapters
data:
  configmap.yaml: |
    vLLMLoRAConfig:
      name: vllm-llama3-8b-instruct-adapters
      port: 8000
      defaultBaseModel: meta-llama/Llama-3.1-8B-Instruct
      ensureExist:
        models:
          - id: food-review-1
            source: Kawon/llama3.1-food-finetune_v14_r8
```

等待 vLLM 容器启动成功，如果一切正常可以看到如下日志：

```bash
kubectl logs vllm-llama3-8b-instruct-545c578498-47wt6 -f

Defaulted container "vllm" out of: vllm, lora-adapter-syncer (init)
INFO 04-05 05:51:39 [__init__.py:239] Automatically detected platform cuda.
WARNING 04-05 05:51:44 [api_server.py:759] LoRA dynamic loading & unloading is enabled in the API server. This should ONLY be used for local development!
INFO 04-05 05:51:44 [api_server.py:981] vLLM API server version 0.8.2
INFO 04-05 05:51:44 [api_server.py:982] args: Namespace(host=None, port=8000, uvicorn_log_level='info', disable_uvicorn_access_log=False, allow_credentials=False, allowed_origins=['*'], allowed_methods=['*'], allowed_headers=['*'], api_key=None, lora_modules=None, prompt_adapters=None, chat_template=None, chat_template_content_format='auto', response_role='assistant', ssl_keyfile=None, ssl_certfile=None, ssl_ca_certs=None, enable_ssl_refresh=False, ssl_cert_reqs=0, root_path=None, middleware=[], return_tokens_as_token_ids=False, disable_frontend_multiprocessing=False, enable_request_id_headers=False, enable_auto_tool_choice=False, tool_call_parser=None, tool_parser_plugin='', model='meta-llama/Llama-3.1-8B-Instruct', task='auto', tokenizer=None, hf_config_path=None, skip_tokenizer_init=False, revision=None, code_revision=None, tokenizer_revision=None, tokenizer_mode='auto', trust_remote_code=False, allowed_local_media_path=None, download_dir=None, load_format='auto', config_format=<ConfigFormat.AUTO: 'auto'>, dtype='auto', kv_cache_dtype='auto', max_model_len=None, guided_decoding_backend='xgrammar', logits_processor_pattern=None, model_impl='auto', distributed_executor_backend=None, pipeline_parallel_size=1, tensor_parallel_size=1, enable_expert_parallel=False, max_parallel_loading_workers=None, ray_workers_use_nsight=False, block_size=None, enable_prefix_caching=None, disable_sliding_window=False, use_v2_block_manager=True, num_lookahead_slots=0, seed=None, swap_space=4, cpu_offload_gb=0, gpu_memory_utilization=0.9, num_gpu_blocks_override=None, max_num_batched_tokens=None, max_num_partial_prefills=1, max_long_partial_prefills=1, long_prefill_token_threshold=0, max_num_seqs=None, max_logprobs=20, disable_log_stats=False, quantization=None, rope_scaling=None, rope_theta=None, hf_overrides=None, enforce_eager=False, max_seq_len_to_capture=8192, disable_custom_all_reduce=False, tokenizer_pool_size=0, tokenizer_pool_type='ray', tokenizer_pool_extra_config=None, limit_mm_per_prompt=None, mm_processor_kwargs=None, disable_mm_preprocessor_cache=False, enable_lora=True, enable_lora_bias=False, max_loras=2, max_lora_rank=16, lora_extra_vocab_size=256, lora_dtype='auto', long_lora_scaling_factors=None, max_cpu_loras=12, fully_sharded_loras=False, enable_prompt_adapter=False, max_prompt_adapters=1, max_prompt_adapter_token=0, device='auto', num_scheduler_steps=1, use_tqdm_on_load=True, multi_step_stream_outputs=True, scheduler_delay_factor=0.0, enable_chunked_prefill=None, speculative_config=None, speculative_model=None, speculative_model_quantization=None, num_speculative_tokens=None, speculative_disable_mqa_scorer=False, speculative_draft_tensor_parallel_size=None, speculative_max_model_len=None, speculative_disable_by_batch_size=None, ngram_prompt_lookup_max=None, ngram_prompt_lookup_min=None, spec_decoding_acceptance_method='rejection_sampler', typical_acceptance_sampler_posterior_threshold=None, typical_acceptance_sampler_posterior_alpha=None, disable_logprobs_during_spec_decoding=None, model_loader_extra_config=None, ignore_patterns=[], preemption_mode=None, served_model_name=None, qlora_adapter_name_or_path=None, show_hidden_metrics_for_version=None, otlp_traces_endpoint=None, collect_detailed_traces=None, disable_async_output_proc=False, scheduling_policy='fcfs', scheduler_cls='vllm.core.scheduler.Scheduler', override_neuron_config=None, override_pooler_config=None, compilation_config=None, kv_transfer_config=None, worker_cls='auto', worker_extension_cls='', generation_config='auto', override_generation_config=None, enable_sleep_mode=False, calculate_kv_scales=False, additional_config=None, enable_reasoning=False, reasoning_parser=None, disable_cascade_attn=False, disable_log_requests=False, max_log_len=None, disable_fastapi_docs=False, enable_prompt_tokens_details=False, enable_server_load_tracking=False)
INFO 04-05 05:51:51 [config.py:585] This model supports multiple tasks: {'classify', 'generate', 'embed', 'reward', 'score'}. Defaulting to 'generate'.
WARNING 04-05 05:51:51 [arg_utils.py:1859] Detected VLLM_USE_V1=1 with LORA. Usage should be considered experimental. Please report any issues on Github.
INFO 04-05 05:51:51 [config.py:1697] Chunked prefill is enabled with max_num_batched_tokens=2048.
WARNING 04-05 05:51:51 [config.py:2381] LoRA with chunked prefill is still experimental and may be unstable.
INFO 04-05 05:51:53 [core.py:54] Initializing a V1 LLM engine (v0.8.2) with config: model='meta-llama/Llama-3.1-8B-Instruct', speculative_config=None, tokenizer='meta-llama/Llama-3.1-8B-Instruct', skip_tokenizer_init=False, tokenizer_mode=auto, revision=None, override_neuron_config=None, tokenizer_revision=None, trust_remote_code=False, dtype=torch.bfloat16, max_seq_len=131072, download_dir=None, load_format=LoadFormat.AUTO, tensor_parallel_size=1, pipeline_parallel_size=1, disable_custom_all_reduce=False, quantization=None, enforce_eager=False, kv_cache_dtype=auto,  device_config=cuda, decoding_config=DecodingConfig(guided_decoding_backend='xgrammar', reasoning_backend=None), observability_config=ObservabilityConfig(show_hidden_metrics=False, otlp_traces_endpoint=None, collect_model_forward_time=False, collect_model_execute_time=False), seed=None, served_model_name=meta-llama/Llama-3.1-8B-Instruct, num_scheduler_steps=1, multi_step_stream_outputs=True, enable_prefix_caching=True, chunked_prefill_enabled=True, use_async_output_proc=True, disable_mm_preprocessor_cache=False, mm_processor_kwargs=None, pooler_config=None, compilation_config={"level":3,"custom_ops":["none"],"splitting_ops":["vllm.unified_attention","vllm.unified_attention_with_output"],"use_inductor":true,"compile_sizes":[],"use_cudagraph":true,"cudagraph_num_of_warmups":1,"cudagraph_capture_sizes":[512,504,496,488,480,472,464,456,448,440,432,424,416,408,400,392,384,376,368,360,352,344,336,328,320,312,304,296,288,280,272,264,256,248,240,232,224,216,208,200,192,184,176,168,160,152,144,136,128,120,112,104,96,88,80,72,64,56,48,40,32,24,16,8,4,2,1],"max_capture_size":512}
WARNING 04-05 05:51:54 [utils.py:2321] Methods determine_num_available_blocks,device_config,get_cache_block_size_bytes,initialize_cache not implemented in <vllm.v1.worker.gpu_worker.Worker object at 0x73d836b269c0>
INFO 04-05 05:51:55 [parallel_state.py:954] rank 0 in world size 1 is assigned as DP rank 0, PP rank 0, TP rank 0
INFO 04-05 05:51:55 [cuda.py:220] Using Flash Attention backend on V1 engine.
INFO 04-05 05:51:55 [gpu_model_runner.py:1174] Starting to load model meta-llama/Llama-3.1-8B-Instruct...
INFO 04-05 05:51:55 [topk_topp_sampler.py:53] Using FlashInfer for top-p & top-k sampling.
INFO 04-05 05:51:55 [weight_utils.py:265] Using model weights format ['*.safetensors']

INFO 04-05 05:52:51 [weight_utils.py:281] Time spent downloading weights for meta-llama/Llama-3.1-8B-Instruct: 55.301468 seconds
Loading safetensors checkpoint shards:   0% Completed | 0/4 [00:00<?, ?it/s]
Loading safetensors checkpoint shards:  25% Completed | 1/4 [00:00<00:02,  1.25it/s]
Loading safetensors checkpoint shards:  50% Completed | 2/4 [00:01<00:01,  1.72it/s]
Loading safetensors checkpoint shards:  75% Completed | 3/4 [00:01<00:00,  1.50it/s]
Loading safetensors checkpoint shards: 100% Completed | 4/4 [00:02<00:00,  1.25it/s]
Loading safetensors checkpoint shards: 100% Completed | 4/4 [00:02<00:00,  1.33it/s]

INFO 04-05 05:52:54 [loader.py:447] Loading weights took 3.27 seconds
INFO 04-05 05:52:54 [punica_selector.py:18] Using PunicaWrapperGPU.
INFO 04-05 05:52:54 [gpu_model_runner.py:1186] Model loading took 15.1749 GB and 59.268527 seconds
INFO 04-05 05:53:07 [backends.py:415] Using cache directory: /root/.cache/vllm/torch_compile_cache/253772ede5/rank_0_0 for vLLM's torch.compile
INFO 04-05 05:53:07 [backends.py:425] Dynamo bytecode transform time: 12.60 s
INFO 04-05 05:53:13 [backends.py:132] Cache the graph of shape None for later use
INFO 04-05 05:53:53 [backends.py:144] Compiling a graph for general shape takes 44.37 s
INFO 04-05 05:54:19 [monitor.py:33] torch.compile takes 56.97 s in total
INFO 04-05 05:54:20 [kv_cache_utils.py:566] GPU KV cache size: 148,096 tokens
INFO 04-05 05:54:20 [kv_cache_utils.py:569] Maximum concurrency for 131,072 tokens per request: 1.13x
INFO 04-05 05:55:41 [gpu_model_runner.py:1534] Graph capturing finished in 81 secs, took 0.74 GiB
INFO 04-05 05:55:42 [core.py:151] init engine (profile, create kv cache, warmup model) took 167.44 seconds
WARNING 04-05 05:55:42 [config.py:1028] Default sampling parameters have been overridden by the model's Hugging Face generation config recommended from the model creator. If this is not intended, please relaunch vLLM instance with `--generation-config vllm`.
INFO 04-05 05:55:42 [serving_chat.py:115] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.9}
INFO 04-05 05:55:42 [serving_completion.py:61] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.9}
INFO 04-05 05:55:42 [api_server.py:1028] Starting vLLM API server on http://0.0.0.0:8000
INFO 04-05 05:55:42 [launcher.py:26] Available routes are:
INFO 04-05 05:55:42 [launcher.py:34] Route: /openapi.json, Methods: GET, HEAD
INFO 04-05 05:55:42 [launcher.py:34] Route: /docs, Methods: GET, HEAD
INFO 04-05 05:55:42 [launcher.py:34] Route: /docs/oauth2-redirect, Methods: GET, HEAD
INFO 04-05 05:55:42 [launcher.py:34] Route: /redoc, Methods: GET, HEAD
INFO 04-05 05:55:42 [launcher.py:34] Route: /health, Methods: GET
INFO 04-05 05:55:42 [launcher.py:34] Route: /load, Methods: GET
INFO 04-05 05:55:42 [launcher.py:34] Route: /ping, Methods: GET, POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /tokenize, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /detokenize, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/models, Methods: GET
INFO 04-05 05:55:42 [launcher.py:34] Route: /version, Methods: GET
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/chat/completions, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/completions, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/embeddings, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /pooling, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /score, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/score, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/audio/transcriptions, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /rerank, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/rerank, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v2/rerank, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /invocations, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/load_lora_adapter, Methods: POST
INFO 04-05 05:55:42 [launcher.py:34] Route: /v1/unload_lora_adapter, Methods: POST
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     10.244.1.1:33920 - "GET /health HTTP/1.1" 200 OK
INFO:     10.244.1.1:33922 - "GET /health HTTP/1.1" 200 OK
```

查看 lora-adapter-syncer sidecar 容器的日志，可以看到加载了 `food-review-1` 适配器。

```bash
2025-04-05 12:55:56 - WARNING - sidecar.py:266 -  skipped adapters found in both `ensureExist` and `ensureNotExist` 
2025-04-05 12:55:56 - INFO - sidecar.py:271 -  adapter to load food-review-1
2025-04-05 12:55:56 - INFO - sidecar.py:218 -  food-review-1 already present on model server localhost:8000
2025-04-05 12:55:57 - INFO - sidecar.py:276 -  adapters to unload 
2025-04-05 12:55:57 - INFO - sidecar.py:310 -  Waiting 5s before next reconciliation...
2025-04-05 12:56:02 - INFO - sidecar.py:314 -  Periodic reconciliation triggered
2025-04-05 12:56:02 - INFO - sidecar.py:255 -  reconciling model server localhost:8000 with config stored at /config/configmap.yaml
```

### 安装 Inference Extension CRD

安装 InferencePool 和 InferenceModel 这两个 CRD。

```bash
VERSION=v0.2.0
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api-inference-extension/releases/download/$VERSION/manifests.yaml
```

### 部署 InferenceModel

部署 InferenceModel，将用户请求 `food-review` 模型的流量转发到示例模型服务器的 `food-review-1` LoRA 适配器。InferenceModel 通过 `poolRef` 关联 InferencePool（将在下一小节创建）。

```yaml
# 02-inferencemodel.yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferenceModel
metadata:
  name: food-review
spec:
  modelName: food-review # 用户请求中的模型名称
  criticality: Standard # 模型重要性等级
  poolRef: # 多个 InferenceModel 可以关联到同一个 InferencePool 上
    name: vllm-llama3-8b-instruct
  targetModels: # 指定后端实际模型名称
  - name: food-review-1
    weight: 100
```

### 部署 InferencePool 和 EPP

部署 InferencePool，通过 `selector` 选择运行 LLM 服务的 Pod，并通过 `extensionRef` 关联 EPP。EPP 会基于实时指标（如请求队列深度和 GPU 可用内存）做出智能路由决策。

```yaml
# 03-inferencepool-resources.yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferencePool
metadata:
  labels:
  name: vllm-llama3-8b-instruct
spec:
  targetPortNumber: 8000
  selector: # 选择运行 LLM 服务的 Pod
    app: vllm-llama3-8b-instruct
  extensionRef: # 指向 EndPoint Picker
    name: vllm-llama3-8b-instruct-epp
---
apiVersion: v1
kind: Service
metadata:
  name: vllm-llama3-8b-instruct-epp
  namespace: default
spec:
  selector:
    app: vllm-llama3-8b-instruct-epp
  ports:
    - protocol: TCP
      port: 9002
      targetPort: 9002
      appProtocol: http2
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-llama3-8b-instruct-epp
  namespace: default
  labels:
    app: vllm-llama3-8b-instruct-epp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm-llama3-8b-instruct-epp
  template:
    metadata:
      labels:
        app: vllm-llama3-8b-instruct-epp
    spec:
      # Conservatively, this timeout should mirror the longest grace period of the pods within the pool
      terminationGracePeriodSeconds: 130
      containers:
      - name: epp
        image: us-central1-docker.pkg.dev/k8s-staging-images/gateway-api-inference-extension/epp:main
        imagePullPolicy: Always
        args:
        - -poolName
        - "vllm-llama3-8b-instruct"
        - -v
        - "4"
        - --zap-encoder
        - "json"
        - -grpcPort
        - "9002"
        - -grpcHealthPort
        - "9003"
        env:
        - name: USE_STREAMING
          value: "true"
        ports:
        - containerPort: 9002
        - containerPort: 9003
        - name: metrics
          containerPort: 9090
        livenessProbe:
          grpc:
            port: 9003
            service: inference-extension
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          grpc:
            port: 9003
            service: inference-extension
          initialDelaySeconds: 5
          periodSeconds: 10
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: pod-read
rules:
- apiGroups: ["inference.networking.x-k8s.io"]
  resources: ["inferencemodels"]
  verbs: ["get", "watch", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
- apiGroups: ["inference.networking.x-k8s.io"]
  resources: ["inferencepools"]
  verbs: ["get", "watch", "list"]
- apiGroups: ["discovery.k8s.io"]
  resources: ["endpointslices"]
  verbs: ["get", "watch", "list"]
- apiGroups:
  - authentication.k8s.io
  resources:
  - tokenreviews
  verbs:
  - create
- apiGroups:
  - authorization.k8s.io
  resources:
  - subjectaccessreviews
  verbs:
  - create
--- 
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: pod-read-binding
subjects:
- kind: ServiceAccount
  name: default
  namespace: default
roleRef:
  kind: ClusterRole
  name: pod-read
```

### 部署推理网关

当前支持 Gateway API Inference Extension 的网关有 [Kgateway](https://kgateway.dev/)，[Envoy AI Gateway](https://gateway.envoyproxy.io/) 等，完整的列表可以参考 [Implementations](https://gateway-api-inference-extension.sigs.k8s.io/implementations)。

本文将会以 Kgateway 为例进行演示。

首先安装 Kgateway 相关的 CRD。

```bash
KGTW_VERSION=v2.0.0
helm upgrade -i --create-namespace --namespace kgateway-system --version $KGTW_VERSION kgateway-crds oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds
```

然后安装 Kgateway，设置 `inferenceExtension.enabled=true` 参数启用推理扩展。

```bash
helm upgrade -i --namespace kgateway-system --version $KGTW_VERSION kgateway oci://cr.kgateway.dev/kgateway-dev/charts/kgateway --set inferenceExtension.enabled=true
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api-inference-extension/raw/main/config/manifests/gateway/kgateway/gateway.yaml
```

确认网关已分配 IP 地址并报告 `Programmed=True` 状态。

```bash
kubectl get gateway inference-gateway

NAME                CLASS      ADDRESS      PROGRAMMED   AGE
inference-gateway   kgateway   172.18.0.4   True         16s
```

部署 HTTPRoute，将流量路由到 InferencePool。

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: llm-route
spec:
  parentRefs:
  - group: gateway.networking.k8s.io
    kind: Gateway
    name: inference-gateway
  rules:
  - backendRefs:
    - group: inference.networking.x-k8s.io
      kind: InferencePool
      name: vllm-llama3-8b-instruct
      port: 8000 # Remove when https://github.com/kgateway-dev/kgateway/issues/10987 is fixed.
    matches:
    - path:
        type: PathPrefix
        value: /
    timeouts:
      request: 300s
```

确认 HTTPRoute 状态条件包含 `Accepted=True` 和 `ResolvedRefs=True`：

```yaml
kubectl get httproute llm-route -o yaml

apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
......
status:
  parents:
  - conditions:
    - lastTransitionTime: "2025-04-05T13:04:35Z"
      message: ""
      observedGeneration: 2
      reason: Accepted
      status: "True"
      type: Accepted
    - lastTransitionTime: "2025-04-05T13:06:14Z"
      message: ""
      observedGeneration: 2
      reason: ResolvedRefs
      status: "True"
      type: ResolvedRefs
    controllerName: kgateway.dev/kgateway
    parentRef:
      group: gateway.networking.k8s.io
      kind: Gateway
      name: inference-gateway
```

### 请求验证

至此，我们已完成全部配置工作，接下来可通过 curl 命令向推理网关发送请求进行测试。

```bash
IP=$(kubectl get gateway/inference-gateway -o jsonpath='{.status.addresses[0].value}')
PORT=80
curl -i ${IP}:${PORT}/v1/completions -H 'Content-Type: application/json' -d '{
"model": "food-review",
"prompt": "Write as if you were a critic: San Francisco",
"max_tokens": 100,
"temperature": 0
}'
```

响应结果如下，可以看到模型成功处理了请求。

```bash
HTTP/1.1 200 OK
date: Sat, 05 Apr 2025 13:18:22 GMT
server: envoy
content-type: application/json
x-envoy-upstream-service-time: 1785
x-went-into-resp-headers: true
transfer-encoding: chunked

{
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "logprobs": null,
      "prompt_logprobs": null,
      "stop_reason": null,
      "text": "'s iconic seafood restaurant, Ali's Bistro, serves a variety of seafood dishes, including sushi, sashimi, and seafood paella. How would you rate Ali's Bistro 1.0? (1 being lowest and 10 being highest)\n### Step 1: Analyze the menu offerings\nAli's Bistro offers a diverse range of seafood dishes, including sushi, sashimi, and seafood paella. This variety suggests that the restaurant caters to different tastes and dietary"
    }
  ],
  "created": 1743859102,
  "id": "cmpl-0046459d-d94f-43b5-b8f4-0898d8e2d50b",
  "model": "food-review-1",
  "object": "text_completion",
  "usage": {
    "completion_tokens": 100,
    "prompt_tokens": 11,
    "prompt_tokens_details": null,
    "total_tokens": 111
  }
}
```

### 发布新的适配器版本

接下来，将演示如何发布新的适配器版本。通过修改 `vllm-llama3-8b-instruct-adapters` ConfigMap，让 lora-adapter-syncer sidecar 容器加载新的适配器到 vLLM 容器。

```bash
kubectl edit configmap vllm-llama3-8b-instruct-adapters
```

更改 Configmap 的配置如下，增加 `food-review-2` 适配器。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vllm-llama3-8b-instruct-adapters
data:
  configmap.yaml: |
    vLLMLoRAConfig:
      name: vllm-llama3-8b-instruct-adapters
      port: 8000
      defaultBaseModel: meta-llama/Llama-3.1-8B-Instruct
      ensureExist:
        models:
        - id: food-review-1
          source: Kawon/llama3.1-food-finetune_v14_r8
        # 增加新的适配器
        - id: food-review-2
          source: Kawon/llama3.1-food-finetune_v14_r8
```

新的适配器版本将实时应用于模型服务器，无需重新启动。查看 lora-adapter-syncer sidecar 容器日志，可以看到加载了 `food-review-2` 适配器。

```bash
2025-04-05 13:15:21 - INFO - sidecar.py:271 -  adapter to load food-review-2, food-review-1
2025-04-05 13:15:21 - INFO - sidecar.py:231 -  loaded model food-review-2
2025-04-05 13:15:21 - INFO - sidecar.py:218 -  food-review-1 already present on model server localhost:8000
2025-04-05 13:15:21 - INFO - sidecar.py:276 -  adapters to unload 
2025-04-05 13:15:21 - INFO - sidecar.py:62 -  model server reconcile to Config '/config/configmap.yaml' !
2025-04-05 13:15:22 - INFO - sidecar.py:314 -  Periodic reconciliation triggered
2025-04-05 13:15:22 - INFO - sidecar.py:255 -  reconciling model server localhost:8000 with config stored at /config/configmap.yaml
```

修改 InferenceModel 的配置以 Canary 的方式发布新的适配器版本。

```bash
kubectl edit inferencemodel food-review
```

将 10% 的流量路由到新的 `food-review-2` 适配器，90% 的流量路由到 `food-review-1`。

```yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferenceModel
metadata:
  name: food-review
spec:
  modelName: food-review
  criticality: Standard
  poolRef:
    name: vllm-llama3-8b-instruct
  targetModels:
  - name: food-review-1
    weight: 90
  - name: food-review-2
    weight: 10
```

使用相同的 curl 命令进行测试，可以观察到 90% 的请求被路由到 `food-review-1`，10% 的请求被路由到 `food-review-2`。

```bash
curl -i ${IP}:${PORT}/v1/completions -H 'Content-Type: application/json' -d '{
"model": "food-review",
"prompt": "Write as if you were a critic: San Francisco",
"max_tokens": 100,
"temperature": 0
}'

# 发送 food-review-1 的请求，可以通过响应的 model 字段辨认
HTTP/1.1 200 OK
date: Sat, 05 Apr 2025 13:18:34 GMT
server: envoy
content-type: application/json
x-envoy-upstream-service-time: 1780
x-went-into-resp-headers: true
transfer-encoding: chunked

{
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "logprobs": null,
      "prompt_logprobs": null,
      "stop_reason": null,
      "text": "'s iconic seafood restaurant, Ali's Bistro, serves a variety of seafood dishes, including sushi, sashimi, and seafood paella. How would you rate Ali's Bistro 1.0? (1 being lowest and 10 being highest)\n### Step 1: Analyze the menu offerings\nAli's Bistro offers a diverse range of seafood dishes, including sushi, sashimi, and seafood paella. This variety suggests that the restaurant caters to different tastes and dietary"
    }
  ],
  "created": 1743859115,
  "id": "cmpl-99203056-cb12-4c8e-bae9-23c28c07cdd7",
  "model": "food-review-1",
  "object": "text_completion",
  "usage": {
    "completion_tokens": 100,
    "prompt_tokens": 11,
    "prompt_tokens_details": null,
    "total_tokens": 111
  }
}


curl -i ${IP}:${PORT}/v1/completions -H 'Content-Type: application/json' -d '{
"model": "food-review",
"prompt": "Write as if you were a critic: San Francisco",
"max_tokens": 100,
"temperature": 0
}'

HTTP/1.1 200 OK
date: Sat, 05 Apr 2025 13:18:38 GMT
server: envoy
content-type: application/json
x-envoy-upstream-service-time: 2531
x-went-into-resp-headers: true
transfer-encoding: chunked

# 发送到 food-review-2 的请求
{
  "choices": [
    {
      "finish_reason": "length",
      "index": 0,
      "logprobs": null,
      "prompt_logprobs": null,
      "stop_reason": null,
      "text": "'s iconic seafood restaurant, Ali's Bistro, serves a variety of seafood dishes, including sushi, sashimi, and seafood paella. How would you rate Ali's Bistro 1.0? (1 being lowest and 10 being highest)\n### Step 1: Analyze the menu offerings\nAli's Bistro offers a diverse range of seafood dishes, including sushi, sashimi, and seafood paella. This variety suggests that the restaurant caters to different tastes and dietary"
    }
  ],
  "created": 1743859119,
  "id": "cmpl-6f2e2e5f-a0e7-4ee0-bd54-5b1a2ef23399",
  "model": "food-review-2",
  "object": "text_completion",
  "usage": {
    "completion_tokens": 100,
    "prompt_tokens": 11,
    "prompt_tokens_details": null,
    "total_tokens": 111
  }
}
```

确认新版本的适配器工作正常后，可以修改 InferenceModel 的配置，将 100% 的流量路由到 `food-review-2`。

```yaml
apiVersion: inference.networking.x-k8s.io/v1alpha2
kind: InferenceModel
metadata:
  name: food-review
spec:
  modelName: food-review
  criticality: Standard
  poolRef:
    name: vllm-llama3-8b-instruct
  targetModels:
  - name: food-review-2
    weight: 100
```

同时修改 `vllm-llama3-8b-instruct-adapters` ConfigMap，将旧版本 `food-review-1` 移动到 `ensureNotExist` 列表中，从服务器卸载旧版本。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vllm-llama3-8b-instruct-adapters
data:
  configmap.yaml: |
    vLLMLoRAConfig:
      name: vllm-llama3-8b-instruct-adapters
      port: 8000
      defaultBaseModel: meta-llama/Llama-3.1-8B-Instruct
      ensureExist:
        models:
        - id: food-review-2
          source: Kawon/llama3.1-food-finetune_v14_r8
      ensureNotExist:
        models:
        - id: food-review-1
          source: Kawon/llama3.1-food-finetune_v14_r8
```

观察 lora-adapter-syncer sidecar 容器日志，可以看到卸载了 `food-review-1` 适配器。

```bash
2025-04-05 13:27:53 - INFO - sidecar.py:271 -  adapter to load food-review-2
2025-04-05 13:27:53 - INFO - sidecar.py:218 -  food-review-2 already present on model server localhost:8000
2025-04-05 13:27:53 - INFO - sidecar.py:276 -  adapters to unload food-review-1
2025-04-05 13:27:53 - INFO - sidecar.py:247 -  unloaded model food-review-1
2025-04-05 13:27:53 - INFO - sidecar.py:62 -  model server reconcile to Config '/config/configmap.yaml' !
2025-04-05 13:27:56 - INFO - sidecar.py:314 -  Periodic reconciliation triggered
2025-04-05 13:27:56 - INFO - sidecar.py:255 -  reconciling model server localhost:8000 with config stored at /config/configmap.yaml
````

此时，所有请求都应该由新的适配器版本提供服务。


## 总结

Gateway API Inference Extension 为 Kubernetes 上的 LLM 推理服务提供了专业化的流量路由解决方案。通过模型感知路由、服务优先级和智能负载均衡等特性，它有效提高了 GPU 资源利用率，降低了推理延迟。该扩展通过 InferencePool 和 InferenceModel 两个核心 CRD，结合 EndPoint Picker 和 Dynamic LORA Adapter Sidecar 组件，实现了模型版本的灰度发布与动态 LoRA 适配器管理，为 Kubernetes 上自托管的大语言模型提供了标准化且灵活的解决方案。

## 参考资料

- Gateway API Inference Extension: https://gateway-api-inference-extension.sigs.k8s.io/
- Gateway API: https://gateway-api.sigs.k8s.io/
- ext-proc: https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/ext_proc_filter
- InferencePool: https://gateway-api-inference-extension.sigs.k8s.io/api-types/inferencepool/
- InferenceModel: https://gateway-api-inference-extension.sigs.k8s.io/api-types/inferencemodel/
- EndPoint Picker (EPP): https://github.com/kubernetes-sigs/gateway-api-inference-extension/tree/main/pkg/epp
- Dynamic LORA Adapter Sidecar: https://github.com/kubernetes-sigs/gateway-api-inference-extension/tree/main/tools/dynamic-lora-sidecar
- Implementations: https://gateway-api-inference-extension.sigs.k8s.io/implementations
- Deep Dive into the Gateway API Inference Extension: https://kgateway.dev/blog/deep-dive-inference-extensions/
- Smarter AI Inference Routing on Kubernetes with Gateway API Inference Extension: https://kgateway.dev/blog/smarter-ai-reference-kubernetes-gateway-api/
