---
title: DeepSeek 开源周第五弹：3FS —— 专为 AI 训练和推理设计的分布式存储
author: Se7en
date: 2025/02/28 21:30
categories:
 - AI
tags:
 - DeepSeek
 - AI
---

# DeepSeek 开源周第五弹：3FS —— 专为 AI 训练和推理设计的分布式存储

DeepSeek 开源周的最后一天，为我们带来了 [Fire-Flyer File System (3FS)](https://github.com/deepseek-ai/3FS)，这是一个专为 AI 训练和推理设计的高效分布式文件系统。此外，DeepSeek 还开源了基于 3FS 的数据处理框架 [Smallpond](https://github.com/deepseek-ai/smallpond)，是一款构建于 DuckDB 和 3FS 之上的轻量级数据处理框架。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502282100271.png)

## 数据处理与存储的挑战

在 AI 训练中，数据存储和访问的效率往往是制约整体性能的关键因素。例如：

- **数据访问延迟**：在分布式训练中，数据通常存储在远程服务器上，频繁的 I/O 操作会导致显著的延迟，拖慢训练速度；
- **存储瓶颈**：随着模型和数据集的规模不断增长，传统的文件系统难以应对高并发的数据访问需求；
- **数据一致性**：在分布式环境中，如何保证数据的一致性和可靠性是一个复杂的挑战。


## 3FS 主要特性和优势

3FS 是一款高性能分布式文件系统，专为应对 AI 训练和推理工作负载的挑战而设计。它利用现代 SSD 和 RDMA 网络，提供一个共享存储层，简化分布式应用的开发。3FS 的主要特性和优势包括：

###  性能与易用性  

- **解耦架构**：融合数千块 SSD 的吞吐能力和数百个存储节点的网络带宽，使应用能够高效地访问存储资源。  
- **强一致性**：基于 **CRAQ（Chain Replication with Apportioned Queries）** 实现强一致性。  
- **文件接口**：基于**事务型键值存储（如 FoundationDB）** 构建无状态元数据服务，采用通用文件接口，无需学习新的存储 API。  

### 多样化工作负载  

- **数据准备**：将数据分析管道的输出组织为分层目录结构，并高效管理大规模中间数据。  
- **数据加载**：支持跨计算节点的随机访问，无需预取或 Shuffle 数据集，提高训练效率。  
- **Checkpoint**：支持大规模训练任务的高吞吐并行 Checkpoint 机制。  
- **推理 KVCache**：提供比 DRAM 缓存更具性价比的方案，具备高吞吐能力，并显著提升缓存容量。

## 3FS 的性能如何？

3FS 在高性能存储方面表现卓越，能够满足 AI 训练和推理的极端 I/O 需求，具体体现在以下几个方面：

### 峰值吞吐量

在大规模读压力测试中，3FS 集群展示了极高的吞吐能力。测试使用 180 个存储节点（每个节点配备 2×200Gbps InfiniBand NICs 和 16 块 14TiB NVMe SSD），并由 500 多个客户端节点发起并发读取请求（每个客户端配备 1×200Gbps InfiniBand NIC）。**最终聚合读吞吐量达到 6.6 TiB/s**，即使在 AI 训练任务带来额外背景流量的情况下，仍能保持卓越的 I/O 性能。  

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502282112103.png)

### GraySort

3FS 在 GraySort 基准测试中表现优异，该测试衡量大规模数据集的排序能力。测试采用两阶段方法：
- 第一阶段：通过 key 的前缀位进行数据分区（Shuffle）。  
- 第二阶段：在各个分区内执行排序。  

测试集群由 25 个存储节点（每个节点包含 2 个 NUMA 域，每个 NUMA 运行 1 个存储服务，2×400Gbps NICs）和 50 个计算节点（每个节点包含 2 个 NUMA 域、192 个物理核心、2.2 TiB RAM 和 1×200Gbps NIC）组成。**在 8192 个分区上对 110.5 TiB 的数据进行排序在 30 分钟 14 秒内完成，平均吞吐量达到 3.66 TiB/分钟**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502282115168.png)

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502282115963.png)

### KVCache

KVCache 是一种用于优化 LLM 推理过程的技术。它通过缓存解码器层中先前 token 的键值向量来避免冗余计算。下图展示了所有 KVCache 客户端的读取吞吐量，**其中峰值吞吐量高达 40 GiB/s**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502282115584.png)


## 总结

回顾本周的发布，DeepSeek 已经构建了完整的大模型技术栈，覆盖从底层计算优化到高效存储管理的关键环节：

- [Day 1 - FlashMLA：高效的 MLA 解码内核，优化变长序列处理，提升推理性能。](https://mp.weixin.qq.com/s/OnPI82oZcxLAMun040ylWA)  
- [Day 2 - DeepEP：首个开源专家并行通信库，助力 MoE 模型的高效训练与推理。](https://mp.weixin.qq.com/s/B-mQgiaHGw9j07jxfJ4NMA)  
- [Day 3 - DeepGEMM：支持密集计算与 MoE 计算的 FP8 GEMM 库，优化矩阵运算效率。](https://mp.weixin.qq.com/s/TOSaduTqDdVAeBZ7KyKhXg)  
- [Day 4 - 优化并行策略：包括 DualPipe 双向流水线并行算法和 EPLB 专家并行负载均衡器，提升并行计算性能。](https://mp.weixin.qq.com/s/SrTnAv9BcngQTy69kpWwdQ)  
- **Day 5 - 3FS 与 Smallpond**：高性能数据存储与处理基础设施，为大规模 AI 任务提供稳定支撑。  

## 参考资料

- deepseek-ai/3FS：https://github.com/deepseek-ai/3FS
- deepseek-ai/smallpond：https://github.com/deepseek-ai/smallpond
