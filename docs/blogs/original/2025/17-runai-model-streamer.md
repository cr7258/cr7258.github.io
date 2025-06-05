---
title: 使用 Run:ai Model Streamer 实现模型的高效加载
author: Se7en
date: 2025/05/20 20:00
categories:
 - AI
tags:
 - AI
 - Inference
---

# 使用 Run:ai Model Streamer 实现模型的高效加载

随着大语言模型（LLM）在生产环境中展现出日益复杂的动态特性，其部署过程的挑战性也随之增加。这一趋势进一步凸显了采用高效模型加载策略的必要性，从而确保模型能够快速响应并满足不断变化的业务需求。大语言模型通常需要数十到数百 GB 的内存，在延迟和资源利用方面带来了重大挑战，尤其是在服务需要根据不可预测的用户需求进行扩展时。此时，冷启动问题尤为突出：模型加载到 GPU 内存所需的时间可能会带来显著延迟，严重影响最终用户体验和机器学习系统的运行效率。

传统的模型加载方法 —— **将张量文件依次从存储传输到 CPU 内存，再从 CPU 内存传输到 GPU** —— 效率低且成本高，尤其是在自动扩缩容的场景下，需要从空闲状态快速启动的能力。因此，许多企业倾向于长期保留大量空闲副本，以免影响用户体验，但这也导致计算成本的显著上升。为了解决这些问题，Run:ai 推出了 [Run:ai Model Streamer](https://github.com/run-ai/runai-model-streamer) 工具。该工具支持从存储中并发读取模型权重并直接流式传输到 GPU，相较现有方法显著提升了加载效率。

## 1 Run:ai Model Streamer 介绍

[Run:ai Model Streamer](https://github.com/run-ai/runai-model-streamer) 的底层采用高性能的 C++ 实现，旨在加速将模型加载到 GPU 的过程，支持来自各种存储类型（如网络文件系统、S3、本地磁盘等）的模型文件。除了性能之外，Run:ai Model Streamer 还提供了 Python SDK，方便集成到现有的推理引擎中（如 vLLM）。

Run:ai Model Streamer 通过使用多线程机制，同时从文件中读取张量数据并将其加载到 CPU 内存中的专用缓冲区中。每个张量会被分配一个标识符，使得应用程序可以在从 CPU 到 GPU 的传输过程中实现张量的并发读取与传输。这意味着，在将某些张量从 CPU 内存传输到 GPU 的同时，还能从存储继续读取其它张量，显著提升了加载效率。

此外，Run:ai Model Streamer 工具充分利用了 GPU 与 CPU 拥有独立子系统的架构特性。GPU 通过 PCIe 总线连接系统，可以直接访问 CPU 内存，无需 CPU 干预。这使得 CPU 端的存储读取和 GPU 的传输可以真正实现实时并行处理，从而在两个子系统间实现高效且快速的模型加载。

Run:ai Model Streamer 的核心特性包括：

* **并发加载**：使用多线程并行读取模型权重文件，缓解存储瓶颈，提高 GPU 利用率。即使是单个张量，也可以被多个线程同时读取。
* **读取负载均衡**：针对不同大小的张量进行负载分配，使得存储带宽可以更充分地被利用，无论模型规模如何都能保持良好性能。
* **支持多种存储类型**：兼容多种存储解决方案，包括本地文件系统（如 SSD）和云端对象存储（如 S3）。
* **无需格式转换**：原生支持 safetensors 格式，无需额外的格式转换，避免加载开销。
* **易于集成**：Run:ai Model Streamer 提供类似 safetensors 的迭代器接口，同时在后台完成并发读取；Python API 简洁易用，便于与 vLLM、TGI 等推理引擎集成，同时享受高性能 C++ 加速层的优势。

Run:ai Model Streamer 支持通过环境变量控制并发读取的参数，例如：

* `RUNAI_STREAMER_CONCURRENCY`：控制并发线程数，默认值为 16。
* `RUNAI_STREAMER_BLOCK_BYTESIZE`：每个线程的数据块大小，对于文件系统默认是 2 MB，对于 S3 默认是 8 MB。
* `RUNAI_STREAMER_MEMORY_LIMIT`：限制 CPU 内存使用量，默认无限制。

完整的环境变量列表可以参考 [Environment Variables](https://github.com/run-ai/runai-model-streamer/blob/master/docs/src/env-vars.md)。

## 2 基准测试

在基准测试中，对 3 种主流模型加载器 —— Run:ai Model Streamer、[Hugging Face (HF) Safetensors Loader](https://huggingface.co/docs/safetensors/index) 和 [Tensorizer](https://www.coreweave.com/blog/coreweaves-tensorizer-decrease-pytorch-model-load-times) 进行了对比，评估它们在不同存储场景下的模型加载效率。详情可以参考：[Run:ai Model Streamer Benchmarks](https://github.com/run-ai/runai-model-streamer/blob/master/docs/src/benchmarks.md)。

基准测试使用了 Meta-Llama-3-8B 模型，这是一个大小为 15 GB 的大语言模型，并以单一的 `.safetensors` 格式存储。测试运行在 AWS g5.12xlarge 实例上，该实例配备了 4 块 NVIDIA A10G GPU（为保证测试一致性，仅使用其中一块 GPU 进行所有测试）。

软件环境包括：

* CUDA 12.4
* vLLM 0.5.5（Transformers 4.44.2）
* Run:ai Model Streamer 0.6.0
* Tensorizer 2.9.0
* Transformers 4.45.0.dev0
* Accelerate 0.34.2

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202506022048894.png)

上图展示了 vLLM 引擎使用 3 种模型加载器在不同存储类型（GP3 SSD、IO2 SSD 和 S3）下完成加载并准备好进行推理所需的总时间。深色柱表示从存储加载模型到 GPU 的耗时，浅色柱则表示 vLLM 引擎整体准备就绪的总耗时（即模型加载时间加上推理引擎预热时间）。

在本地存储（GP3 和 IO2 SSD）场景下，Run:ai Model Streamer 和 Tensorizer 均显著优于 Hugging Face (HF) Safetensors Loader，使整体就绪时间几乎缩短了一半。

而在 S3 存储场景中，仅对 Run:ai Model Streamer 和 Tensorizer 进行了测试，其中 Run:ai Model Streamer 表现出明显更快的就绪速度。需要指出的是，由于 Hugging Face 的 Safetensors Loader 不支持直接从 S3 加载模型，因此未参与该场景的对比。

在各项实验中，Run:ai Model Streamer 相较其他模型加载器均展现出了显著的性能优势。

> 本地存储（如 GP3 和 IO2 SSD）场景指的是模型已预先下载到本地磁盘，因此加载时间不包含下载过程。而在 S3 存储场景中，模型文件存储于 S3，加载时间则包含了从 S3 下载模型的过程。从图中可以看到，Run:ai Model Streamer 在 S3 场景下反而表现更快，这与网络带宽关系密切。基准测试中，虚拟机与 S3 Bucket 位于同一区域，带宽高达 4GB/s。结合 Run:ai Model Streamer 的并发读取能力，使其能够充分利用 S3 的读取带宽，因此在 S3 场景下展现出更优性能。


## 3 使用 Run:ai Model Streamer

Run:ai Model Streamer 支持通过 Python SDK 进行使用，具体可参考官方文档 [Using Run:ai Model Streamer](https://github.com/run-ai/runai-model-streamer/blob/master/docs/src/usage.md)。目前，vLLM 已经集成 Run:ai Model Streamer，因此本文将基于 vLLM 演示如何使用 Run:ai Model Streamer 加载模型。为了便于实验，本文在 Google Colab 上运行 vLLM，并使用了 A100 GPU。

> 需要注意的是，在 Google Colab 中运行 shell 命令时需要使用 `!` 开头，这是 Colab 提供的一种方式，用来在 Jupyter Notebook 环境中运行终端命令。

### 3.1 安装 vLLM 和 Run:ai Model Streamer

执行以下命令，安装含有 Run:ai Model Streamer 依赖的 vLLM：

```bash
pip install vllm[runai]
```

### 3.2 vLLM 使用 Run:ai Model Streamer 加载模型

我们先看看在不使用 Run:ai Model Streamer 的情况下，vLLM 加载模型需要多长时间。vLLM 默认使用 Hugging Face (HF) Safetensors Loader 来加载模型。本次实验使用 `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` 模型，大小约为 3.55GB。这里已经提前将模型下载到本地。也可以先执行一次 vllm serve 命令，在默认情况下，vLLM 会自动从 Hugging Face 下载模型。

```bash
vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
```

输出显示，模型加载的时间为 1.67 秒。

```bash
WARNING 06-05 09:07:45 [utils.py:2671] Methods determine_num_available_blocks,device_config,get_cache_block_size_bytes,initialize_cache not implemented in <vllm.v1.worker.gpu_worker.Worker object at 0x7e22fac35e10>
INFO 06-05 09:07:46 [parallel_state.py:1064] rank 0 in world size 1 is assigned as DP rank 0, PP rank 0, TP rank 0, EP rank 0
WARNING 06-05 09:07:46 [topk_topp_sampler.py:58] FlashInfer is not available. Falling back to the PyTorch-native implementation of top-p & top-k sampling. For the best performance, please install FlashInfer.
INFO 06-05 09:07:46 [gpu_model_runner.py:1531] Starting to load model deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B...
INFO 06-05 09:07:46 [cuda.py:217] Using Flash Attention backend on V1 engine.
INFO 06-05 09:07:46 [backends.py:35] Using InductorAdaptor
INFO 06-05 09:07:46 [weight_utils.py:291] Using model weights format ['*.safetensors']
INFO 06-05 09:07:47 [weight_utils.py:344] No model.safetensors.index.json found in remote.
Loading safetensors checkpoint shards: 100% 1/1 [00:00<00:00,  1.04it/s]
INFO 06-05 09:07:48 [default_loader.py:280] Loading weights took 1.16 seconds
INFO 06-05 09:07:48 [gpu_model_runner.py:1549] Model loading took 3.3466 GiB and 1.677846 seconds
INFO 06-05 09:07:57 [backends.py:459] Using cache directory: /root/.cache/vllm/torch_compile_cache/8a096745b4/rank_0_0 for vLLM's torch.compile
INFO 06-05 09:07:57 [backends.py:469] Dynamo bytecode transform time: 8.69 s
INFO 06-05 09:08:03 [backends.py:132] Directly load the compiled graph(s) for shape None from the cache, took 6.203 s
INFO 06-05 09:08:04 [monitor.py:33] torch.compile takes 8.69 s in total
INFO 06-05 09:08:05 [kv_cache_utils.py:637] GPU KV cache size: 1,131,008 tokens
INFO 06-05 09:08:05 [kv_cache_utils.py:640] Maximum concurrency for 131,072 tokens per request: 8.63x
INFO 06-05 09:08:36 [gpu_model_runner.py:1933] Graph capturing finished in 31 secs, took 0.45 GiB
INFO 06-05 09:08:36 [core.py:167] init engine (profile, create kv cache, warmup model) took 47.64 seconds
INFO 06-05 09:08:37 [loggers.py:134] vllm cache_config_info with initialization after num_gpu_blocks is: 70688
WARNING 06-05 09:08:37 [config.py:1339] Default sampling parameters have been overridden by the model's Hugging Face generation config recommended from the model creator. If this is not intended, please relaunch vLLM instance with `--generation-config vllm`.
INFO 06-05 09:08:37 [serving_chat.py:117] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-05 09:08:37 [serving_completion.py:65] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-05 09:08:37 [api_server.py:1336] Starting vLLM API server on http://0.0.0.0:8000
INFO 06-05 09:08:37 [launcher.py:28] Available routes are:
INFO 06-05 09:08:37 [launcher.py:36] Route: /openapi.json, Methods: GET, HEAD
INFO 06-05 09:08:37 [launcher.py:36] Route: /docs, Methods: GET, HEAD
INFO 06-05 09:08:37 [launcher.py:36] Route: /docs/oauth2-redirect, Methods: GET, HEAD
INFO 06-05 09:08:37 [launcher.py:36] Route: /redoc, Methods: GET, HEAD
INFO 06-05 09:08:37 [launcher.py:36] Route: /health, Methods: GET
INFO 06-05 09:08:37 [launcher.py:36] Route: /load, Methods: GET
INFO 06-05 09:08:37 [launcher.py:36] Route: /ping, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /ping, Methods: GET
INFO 06-05 09:08:37 [launcher.py:36] Route: /tokenize, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /detokenize, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/models, Methods: GET
INFO 06-05 09:08:37 [launcher.py:36] Route: /version, Methods: GET
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/chat/completions, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/completions, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/embeddings, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /pooling, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /classify, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /score, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/score, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/audio/transcriptions, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /rerank, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v1/rerank, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /v2/rerank, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /invocations, Methods: POST
INFO 06-05 09:08:37 [launcher.py:36] Route: /metrics, Methods: GET
INFO:     Started server process [3604]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

接下来看看 vLLM 使用 Run:ai Model Streamer 加载模型的效果。通过 `--load-format runai_streamer` 参数指定使用 Run:ai Model Streamer 加载模型，并将并发读取线程数设置为 32。

```bash
RUNAI_STREAMER_CONCURRENCY=32 vllm serve \
deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B \
--load-format runai_streamer
```

输出显示模型加载时间为 1.39 秒，Run:ai Model Streamer 略快于 Hugging Face（HF）Safetensors Loader 的 1.67 秒。估计在模型体积更大的情况下，Run:ai Model Streamer 的优势才能凸显出来。

```bash
2025-06-05 09:09:04.266684: I tensorflow/core/util/port.cc:153] oneDNN custom operations are on. You may see slightly different numerical results due to floating-point round-off errors from different computation orders. To turn them off, set the environment variable `TF_ENABLE_ONEDNN_OPTS=0`.
2025-06-05 09:09:04.284447: E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:477] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1749114544.305995    4302 cuda_dnn.cc:8310] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
E0000 00:00:1749114544.312488    4302 cuda_blas.cc:1418] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
2025-06-05 09:09:04.333772: I tensorflow/core/platform/cpu_feature_guard.cc:210] This TensorFlow binary is optimized to use available CPU instructions in performance-critical operations.
To enable the following instructions: AVX2 AVX512F AVX512_VNNI FMA, in other operations, rebuild TensorFlow with the appropriate compiler flags.
INFO 06-05 09:09:08 [__init__.py:243] Automatically detected platform cuda.
INFO 06-05 09:09:13 [__init__.py:31] Available plugins for group vllm.general_plugins:
INFO 06-05 09:09:13 [__init__.py:33] - lora_filesystem_resolver -> vllm.plugins.lora_resolvers.filesystem_resolver:register_filesystem_resolver
INFO 06-05 09:09:13 [__init__.py:36] All plugins in this group will be loaded. Set `VLLM_PLUGINS` to control which plugins to load.
INFO 06-05 09:09:15 [api_server.py:1289] vLLM API server version 0.9.0.1
INFO 06-05 09:09:16 [cli_args.py:300] non-default args: {'load_format': 'runai_streamer'}
INFO 06-05 09:09:31 [config.py:793] This model supports multiple tasks: {'generate', 'classify', 'reward', 'score', 'embed'}. Defaulting to 'generate'.
INFO 06-05 09:09:31 [config.py:2118] Chunked prefill is enabled with max_num_batched_tokens=2048.
2025-06-05 09:09:35.979624: E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:477] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1749114576.000379    4527 cuda_dnn.cc:8310] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
E0000 00:00:1749114576.006659    4527 cuda_blas.cc:1418] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
INFO 06-05 09:09:40 [__init__.py:243] Automatically detected platform cuda.
INFO 06-05 09:09:44 [core.py:438] Waiting for init message from front-end.
INFO 06-05 09:09:44 [__init__.py:31] Available plugins for group vllm.general_plugins:
INFO 06-05 09:09:44 [__init__.py:33] - lora_filesystem_resolver -> vllm.plugins.lora_resolvers.filesystem_resolver:register_filesystem_resolver
INFO 06-05 09:09:44 [__init__.py:36] All plugins in this group will be loaded. Set `VLLM_PLUGINS` to control which plugins to load.
INFO 06-05 09:09:44 [core.py:65] Initializing a V1 LLM engine (v0.9.0.1) with config: model='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', speculative_config=None, tokenizer='deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', skip_tokenizer_init=False, tokenizer_mode=auto, revision=None, override_neuron_config={}, tokenizer_revision=None, trust_remote_code=False, dtype=torch.bfloat16, max_seq_len=131072, download_dir=None, load_format=LoadFormat.RUNAI_STREAMER, tensor_parallel_size=1, pipeline_parallel_size=1, disable_custom_all_reduce=False, quantization=None, enforce_eager=False, kv_cache_dtype=auto,  device_config=cuda, decoding_config=DecodingConfig(backend='auto', disable_fallback=False, disable_any_whitespace=False, disable_additional_properties=False, reasoning_backend=''), observability_config=ObservabilityConfig(show_hidden_metrics_for_version=None, otlp_traces_endpoint=None, collect_detailed_traces=None), seed=0, served_model_name=deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, num_scheduler_steps=1, multi_step_stream_outputs=True, enable_prefix_caching=True, chunked_prefill_enabled=True, use_async_output_proc=True, pooler_config=None, compilation_config={"level": 3, "custom_ops": ["none"], "splitting_ops": ["vllm.unified_attention", "vllm.unified_attention_with_output"], "compile_sizes": [], "inductor_compile_config": {"enable_auto_functionalized_v2": false}, "use_cudagraph": true, "cudagraph_num_of_warmups": 1, "cudagraph_capture_sizes": [512, 504, 496, 488, 480, 472, 464, 456, 448, 440, 432, 424, 416, 408, 400, 392, 384, 376, 368, 360, 352, 344, 336, 328, 320, 312, 304, 296, 288, 280, 272, 264, 256, 248, 240, 232, 224, 216, 208, 200, 192, 184, 176, 168, 160, 152, 144, 136, 128, 120, 112, 104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16, 8, 4, 2, 1], "max_capture_size": 512}
WARNING 06-05 09:09:44 [utils.py:2671] Methods determine_num_available_blocks,device_config,get_cache_block_size_bytes,initialize_cache not implemented in <vllm.v1.worker.gpu_worker.Worker object at 0x7ba81e1bda10>
INFO 06-05 09:09:45 [parallel_state.py:1064] rank 0 in world size 1 is assigned as DP rank 0, PP rank 0, TP rank 0, EP rank 0
WARNING 06-05 09:09:45 [topk_topp_sampler.py:58] FlashInfer is not available. Falling back to the PyTorch-native implementation of top-p & top-k sampling. For the best performance, please install FlashInfer.
INFO 06-05 09:09:45 [gpu_model_runner.py:1531] Starting to load model deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B...
INFO 06-05 09:09:45 [cuda.py:217] Using Flash Attention backend on V1 engine.
INFO 06-05 09:09:45 [backends.py:35] Using InductorAdaptor
INFO 06-05 09:09:45 [weight_utils.py:291] Using model weights format ['*.safetensors']
INFO 06-05 09:09:45 [weight_utils.py:344] No model.safetensors.index.json found in remote.
Loading safetensors using Runai Model Streamer:   0% 0/1 [00:00<?, ?it/s][RunAI Streamer] CPU Buffer size: 3.3 GiB for file: model.safetensors
Read throughput is 16.69 GB per second 
Loading safetensors using Runai Model Streamer: 100% 1/1 [00:00<00:00,  1.05it/s]
[RunAI Streamer] Overall time to stream 3.3 GiB of all files: 0.96s, 3.5 GiB/s
INFO 06-05 09:09:47 [gpu_model_runner.py:1549] Model loading took 3.3466 GiB and 1.397818 seconds
INFO 06-05 09:09:55 [backends.py:459] Using cache directory: /root/.cache/vllm/torch_compile_cache/8a096745b4/rank_0_0 for vLLM's torch.compile
INFO 06-05 09:09:55 [backends.py:469] Dynamo bytecode transform time: 8.74 s
INFO 06-05 09:10:02 [backends.py:132] Directly load the compiled graph(s) for shape None from the cache, took 6.162 s
INFO 06-05 09:10:03 [monitor.py:33] torch.compile takes 8.74 s in total
INFO 06-05 09:10:04 [kv_cache_utils.py:637] GPU KV cache size: 1,131,008 tokens
INFO 06-05 09:10:04 [kv_cache_utils.py:640] Maximum concurrency for 131,072 tokens per request: 8.63x
INFO 06-05 09:10:35 [gpu_model_runner.py:1933] Graph capturing finished in 31 secs, took 0.45 GiB
INFO 06-05 09:10:35 [core.py:167] init engine (profile, create kv cache, warmup model) took 47.99 seconds
INFO 06-05 09:10:35 [loggers.py:134] vllm cache_config_info with initialization after num_gpu_blocks is: 70688
WARNING 06-05 09:10:35 [config.py:1339] Default sampling parameters have been overridden by the model's Hugging Face generation config recommended from the model creator. If this is not intended, please relaunch vLLM instance with `--generation-config vllm`.
INFO 06-05 09:10:35 [serving_chat.py:117] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-05 09:10:36 [serving_completion.py:65] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-05 09:10:36 [api_server.py:1336] Starting vLLM API server on http://0.0.0.0:8000
INFO 06-05 09:10:36 [launcher.py:28] Available routes are:
INFO 06-05 09:10:36 [launcher.py:36] Route: /openapi.json, Methods: HEAD, GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /docs, Methods: HEAD, GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /docs/oauth2-redirect, Methods: HEAD, GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /redoc, Methods: HEAD, GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /health, Methods: GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /load, Methods: GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /ping, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /ping, Methods: GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /tokenize, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /detokenize, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/models, Methods: GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /version, Methods: GET
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/chat/completions, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/completions, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/embeddings, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /pooling, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /classify, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /score, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/score, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/audio/transcriptions, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /rerank, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v1/rerank, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /v2/rerank, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /invocations, Methods: POST
INFO 06-05 09:10:36 [launcher.py:36] Route: /metrics, Methods: GET
INFO:     Started server process [4302]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

最后，我们来看看使用 Run:ai Model Streamer 直接从 S3 加载模型的性能表现。关于如何将模型从 Hugging Face 下载并上传至 S3，请参考文章末尾的附录部分。

使用 `vllm serve` 命令从 S3 Bucket `s3://cr7258/DeepSeek-R1-Distill-Qwen-1.5B` 加载模型，并通过 `--load-format runai_streamer` 参数指定使用 Run\:ai Model Streamer，同时将并发线程数设置为 32。需要注意的是，默认的下载请求超时时间为 1 秒，如果网络较慢，可能会导致超时。此时可以通过设置环境变量 `RUNAI_STREAMER_S3_REQUEST_TIMEOUT_MS` 来延长超时时间。另外，你还需要设置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY` 环境变量以确保有权限访问 S3。

```bash
RUNAI_STREAMER_CONCURRENCY=32 \
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID> \
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY> \
RUNAI_STREAMER_S3_REQUEST_TIMEOUT_MS=30000 \
vllm serve s3://cr7258/DeepSeek-R1-Distill-Qwen-1.5B \
--load-format runai_streamer
```

输出结果显示，从 S3 直接加载模型的耗时为 6.10 秒。由于服务器访问 S3 的平均读取带宽约为 650 MB/s，远低于基准测试中 4 GB/s 的理想带宽，因此在本次实验中，Run:ai Model Streamer 从 S3 加载模型的时间高于从本地文件系统加载的时间。

```bash
2025-06-02 11:01:34.931920: I tensorflow/core/util/port.cc:153] oneDNN custom operations are on. You may see slightly different numerical results due to floating-point round-off errors from different computation orders. To turn them off, set the environment variable `TF_ENABLE_ONEDNN_OPTS=0`.
2025-06-02 11:01:34.950789: E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:477] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1748862094.972433   41707 cuda_dnn.cc:8310] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
E0000 00:00:1748862094.979005   41707 cuda_blas.cc:1418] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
2025-06-02 11:01:35.001932: I tensorflow/core/platform/cpu_feature_guard.cc:210] This TensorFlow binary is optimized to use available CPU instructions in performance-critical operations.
To enable the following instructions: AVX2 AVX512F AVX512_VNNI FMA, in other operations, rebuild TensorFlow with the appropriate compiler flags.
INFO 06-02 11:01:39 [__init__.py:243] Automatically detected platform cuda.
INFO 06-02 11:01:43 [__init__.py:31] Available plugins for group vllm.general_plugins:
INFO 06-02 11:01:43 [__init__.py:33] - lora_filesystem_resolver -> vllm.plugins.lora_resolvers.filesystem_resolver:register_filesystem_resolver
INFO 06-02 11:01:43 [__init__.py:36] All plugins in this group will be loaded. Set `VLLM_PLUGINS` to control which plugins to load.
INFO 06-02 11:01:46 [api_server.py:1289] vLLM API server version 0.9.0.1
INFO 06-02 11:01:47 [cli_args.py:300] non-default args: {'load_format': 'runai_streamer'}
INFO 06-02 11:02:04 [config.py:793] This model supports multiple tasks: {'score', 'embed', 'classify', 'reward', 'generate'}. Defaulting to 'generate'.
INFO 06-02 11:02:04 [config.py:2118] Chunked prefill is enabled with max_num_batched_tokens=2048.
2025-06-02 11:02:08.707315: E external/local_xla/xla/stream_executor/cuda/cuda_fft.cc:477] Unable to register cuFFT factory: Attempting to register factory for plugin cuFFT when one has already been registered
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1748862128.728450   41962 cuda_dnn.cc:8310] Unable to register cuDNN factory: Attempting to register factory for plugin cuDNN when one has already been registered
E0000 00:00:1748862128.735275   41962 cuda_blas.cc:1418] Unable to register cuBLAS factory: Attempting to register factory for plugin cuBLAS when one has already been registered
INFO 06-02 11:02:13 [__init__.py:243] Automatically detected platform cuda.
INFO 06-02 11:02:17 [core.py:438] Waiting for init message from front-end.
INFO 06-02 11:02:17 [__init__.py:31] Available plugins for group vllm.general_plugins:
INFO 06-02 11:02:17 [__init__.py:33] - lora_filesystem_resolver -> vllm.plugins.lora_resolvers.filesystem_resolver:register_filesystem_resolver
INFO 06-02 11:02:17 [__init__.py:36] All plugins in this group will be loaded. Set `VLLM_PLUGINS` to control which plugins to load.
INFO 06-02 11:02:17 [core.py:65] Initializing a V1 LLM engine (v0.9.0.1) with config: model='/tmp/tmpgsyzgagq', speculative_config=None, tokenizer='/tmp/tmpgsyzgagq', skip_tokenizer_init=False, tokenizer_mode=auto, revision=None, override_neuron_config={}, tokenizer_revision=None, trust_remote_code=False, dtype=torch.bfloat16, max_seq_len=131072, download_dir=None, load_format=LoadFormat.RUNAI_STREAMER, tensor_parallel_size=1, pipeline_parallel_size=1, disable_custom_all_reduce=False, quantization=None, enforce_eager=False, kv_cache_dtype=auto,  device_config=cuda, decoding_config=DecodingConfig(backend='auto', disable_fallback=False, disable_any_whitespace=False, disable_additional_properties=False, reasoning_backend=''), observability_config=ObservabilityConfig(show_hidden_metrics_for_version=None, otlp_traces_endpoint=None, collect_detailed_traces=None), seed=0, served_model_name=/tmp/tmpgsyzgagq, num_scheduler_steps=1, multi_step_stream_outputs=True, enable_prefix_caching=True, chunked_prefill_enabled=True, use_async_output_proc=True, pooler_config=None, compilation_config={"level": 3, "custom_ops": ["none"], "splitting_ops": ["vllm.unified_attention", "vllm.unified_attention_with_output"], "compile_sizes": [], "inductor_compile_config": {"enable_auto_functionalized_v2": false}, "use_cudagraph": true, "cudagraph_num_of_warmups": 1, "cudagraph_capture_sizes": [512, 504, 496, 488, 480, 472, 464, 456, 448, 440, 432, 424, 416, 408, 400, 392, 384, 376, 368, 360, 352, 344, 336, 328, 320, 312, 304, 296, 288, 280, 272, 264, 256, 248, 240, 232, 224, 216, 208, 200, 192, 184, 176, 168, 160, 152, 144, 136, 128, 120, 112, 104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16, 8, 4, 2, 1], "max_capture_size": 512}
WARNING 06-02 11:02:17 [utils.py:2671] Methods determine_num_available_blocks,device_config,get_cache_block_size_bytes,initialize_cache not implemented in <vllm.v1.worker.gpu_worker.Worker object at 0x7dbb4235fcd0>
INFO 06-02 11:02:18 [parallel_state.py:1064] rank 0 in world size 1 is assigned as DP rank 0, PP rank 0, TP rank 0, EP rank 0
WARNING 06-02 11:02:18 [topk_topp_sampler.py:58] FlashInfer is not available. Falling back to the PyTorch-native implementation of top-p & top-k sampling. For the best performance, please install FlashInfer.
INFO 06-02 11:02:18 [gpu_model_runner.py:1531] Starting to load model /tmp/tmpgsyzgagq...
INFO 06-02 11:02:18 [cuda.py:217] Using Flash Attention backend on V1 engine.
INFO 06-02 11:02:18 [backends.py:35] Using InductorAdaptor
Loading safetensors using Runai Model Streamer:   0% 0/1 [00:00<?, ?it/s][RunAI Streamer] CPU Buffer size: 3.3 GiB for file: model.safetensors
Read throughput is 717.15 MB per second 
Loading safetensors using Runai Model Streamer: 100% 1/1 [00:05<00:00,  5.40s/it]
[RunAI Streamer] Overall time to stream 3.3 GiB of all files: 5.4s, 627.2 MiB/s
INFO 06-02 11:02:24 [gpu_model_runner.py:1549] Model loading took 3.3466 GiB and 6.107927 seconds
INFO 06-02 11:02:33 [backends.py:459] Using cache directory: /root/.cache/vllm/torch_compile_cache/05829a99e1/rank_0_0 for vLLM's torch.compile
INFO 06-02 11:02:33 [backends.py:469] Dynamo bytecode transform time: 9.05 s
INFO 06-02 11:02:37 [backends.py:158] Cache the graph of shape None for later use
INFO 06-02 11:03:11 [backends.py:170] Compiling a graph for general shape takes 36.76 s
INFO 06-02 11:03:17 [monitor.py:33] torch.compile takes 45.81 s in total
INFO 06-02 11:03:18 [kv_cache_utils.py:637] GPU KV cache size: 1,131,008 tokens
INFO 06-02 11:03:18 [kv_cache_utils.py:640] Maximum concurrency for 131,072 tokens per request: 8.63x
INFO 06-02 11:03:55 [gpu_model_runner.py:1933] Graph capturing finished in 37 secs, took 0.45 GiB
INFO 06-02 11:03:55 [core.py:167] init engine (profile, create kv cache, warmup model) took 90.84 seconds
INFO 06-02 11:03:56 [loggers.py:134] vllm cache_config_info with initialization after num_gpu_blocks is: 70688
WARNING 06-02 11:03:56 [config.py:1339] Default sampling parameters have been overridden by the model's Hugging Face generation config recommended from the model creator. If this is not intended, please relaunch vLLM instance with `--generation-config vllm`.
INFO 06-02 11:03:56 [serving_chat.py:117] Using default chat sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-02 11:03:56 [serving_completion.py:65] Using default completion sampling params from model: {'temperature': 0.6, 'top_p': 0.95}
INFO 06-02 11:03:56 [api_server.py:1336] Starting vLLM API server on http://0.0.0.0:8000
INFO 06-02 11:03:56 [launcher.py:28] Available routes are:
INFO 06-02 11:03:56 [launcher.py:36] Route: /openapi.json, Methods: GET, HEAD
INFO 06-02 11:03:56 [launcher.py:36] Route: /docs, Methods: GET, HEAD
INFO 06-02 11:03:56 [launcher.py:36] Route: /docs/oauth2-redirect, Methods: GET, HEAD
INFO 06-02 11:03:56 [launcher.py:36] Route: /redoc, Methods: GET, HEAD
INFO 06-02 11:03:56 [launcher.py:36] Route: /health, Methods: GET
INFO 06-02 11:03:56 [launcher.py:36] Route: /load, Methods: GET
INFO 06-02 11:03:56 [launcher.py:36] Route: /ping, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /ping, Methods: GET
INFO 06-02 11:03:56 [launcher.py:36] Route: /tokenize, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /detokenize, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/models, Methods: GET
INFO 06-02 11:03:56 [launcher.py:36] Route: /version, Methods: GET
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/chat/completions, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/completions, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/embeddings, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /pooling, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /classify, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /score, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/score, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/audio/transcriptions, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /rerank, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v1/rerank, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /v2/rerank, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /invocations, Methods: POST
INFO 06-02 11:03:56 [launcher.py:36] Route: /metrics, Methods: GET
INFO:     Started server process [41707]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## 4 附录

### 4.1 从 Hugging Face 下载模型并上传至 S3

首先在 AWS S3 创建一个 Bucket（本文以 `cr7258` 为例），并在 Bucket 中创建一个文件夹用于存储模型权重文件（本文以 `DeepSeek-R1-Distill-Qwen-1.5B` 为例）。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505302225302.png)

然后使用 [huggingface-cli](https://huggingface.co/docs/huggingface_hub/guides/cli) 从 Hugging Face 下载模型。

```bash
pip install "huggingface_hub[cli]"
huggingface-cli download deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
```

模型会被下载至 `/root/.cache/huggingface/hub/models--deepseek-ai--DeepSeek-R1-Distill-Qwen-1.5B` 目录中。

然后使用 `aws s3 sync` 命令将模型上传到 S3。模型文件位于 `snapshots` 子目录下，具体的目录名是 Hugging Face 在某次发布或更新模型时生成的哈希值，本例中为 `ad9f0ae0864d7fbcd1cd905e3c6c5b069cc8b562`。

```bash
pip install awscli
aws s3 sync \
 ~/.cache/huggingface/hub/models--deepseek-ai--DeepSeek-R1-Distill-Qwen-1.5B/snapshots/ad9f0ae0864d7fbcd1cd905e3c6c5b069cc8b562/ \
 s3://cr7258/DeepSeek-R1-Distill-Qwen-1.5B/
```

注意：你需要设置好以下环境变量，确保你有权限能够访问 S3。

```bash
export AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
```

上传后的效果如下：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202505302227013.png)

### 4.2 故障排查

如果在使用 Run:ai Model Streamer 加载模型时遇到问题，可以设置以下环境变量来获取更详细的日志信息。

```bash
RUNAI_STREAMER_LOG_TO_STDERR=1 RUNAI_STREAMER_LOG_LEVEL=DEBUG
```

## 5 总结

本文介绍了 Run:ai Model Streamer 这一高效的模型加载工具，它通过并发读取模型权重并直接流式传输到 GPU，显著提升了大型模型的加载效率。基准测试表明，相比于 Hugging Face (HF) Safetensors Loader 和 Tensorizer，Run:ai Model Streamer 在各种存储场景下均展现出了明显的性能优势，特别是在从 S3 等远程存储加载模型时效果更为显著。文章还结合实验，演示了如何在 vLLM 中集成并使用 Run:ai Model Streamer 加载模型。

## 6 参考资料

- Run:ai Model Streamer: Performance Benchmarks：https://pages.run.ai/hubfs/PDFs/White%20Papers/Model-Streamer-Performance-Benchmarks.pdf
- Loading models with Run:ai Model Streamer：https://docs.vllm.ai/en/v0.8.2/models/extensions/runai_model_streamer.html
- runai-model-streamer：https://github.com/run-ai/runai-model-streamer
- Loading Llama-2 70b 20x faster with Anyscale Endpoints：https://www.anyscale.com/blog/loading-llama-2-70b-20x-faster-with-anyscale-endpoints#anyscale-model-loader
- 'File access error' when attempting to access s3-compatible storage in Kubernetes, works in Docker：https://github.com/run-ai/runai-model-streamer/issues/55#issuecomment-2884254292

## 7 欢迎关注

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202503222156941.png)
