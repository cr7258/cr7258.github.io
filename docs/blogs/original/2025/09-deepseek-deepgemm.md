---
title: DeepSeek 开源周第三弹：DeepGEMM —— 高效的 FP8 GEMM 库，核心代码仅 300 行！
author: Se7en
date: 2025/02/26 21:30
categories:
 - AI
tags:
 - DeepSeek
 - AI
---

# DeepSeek 开源周第三弹：DeepGEMM —— 高效的 FP8 GEMM 库，核心代码仅 300 行！

2025 年 2 月 26 日，DeepSeek 在开源周的第三天，正式发布了高效的 FP8 通用矩阵乘法（GEMM）库 —— [DeepGEMM](https://github.com/deepseek-ai/DeepGEMM)。该库支持密集矩阵和混合专家（MoE）架构的 GEMM 运算，为 V3/R1 模型的训练和推理提供了强有力的支持。值得一提的是，DeepGEMM 的核心代码仅约 300 行，但性能表现卓越。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502262137173.png)

## 为什么需要 DeepGEMM？

在大规模模型训练和推理中，矩阵乘法（GEMM，General Matrix Multiplications）是最核心的计算操作之一，尤其是在深度学习模型的训练和推理过程中，GEMM 占据了绝大部分的计算资源。随着模型规模的不断扩大，尤其是混合专家模型（MoE）的兴起，传统的 GEMM 实现已经无法满足高效计算的需求。MoE 模型通过动态激活部分专家来提升模型容量，但这也引入了稀疏性和动态性，使得传统的密集矩阵乘法难以高效处理。

此外，低精度计算（如 FP8）在深度学习中的应用越来越广泛，因为它能够在减少内存占用的同时保持较高的计算效率。然而，现有的 GEMM 库对 FP8 的支持有限，尤其是在 MoE 场景下，缺乏针对性的优化。DeepGEMM 的发布正是为了解决这些问题，它提供了高效的 FP8 矩阵乘法实现，支持密集和 MoE 两种模式，显著提升了大规模模型训练和推理的效率。

## DeepGEMM 的特点

DeepGEMM 的主要特点如下：

- **高性能**：在 NVIDIA Hopper GPU 上，DeepGEMM 的 FP8 计算性能超过 1350 TFLOPS，内存带宽峰值达到 2668 GB/s。
- **FP8支持**：作为首个针对 Hopper GPU 优化的 FP8 GEMM 库，DeepGEMM 能够显著减少内存占用并加速模型训练和推理过程
- **简洁而强大的实现**：尽管 DeepGEMM 的核心代码仅约 300 行，但它却能够实现超越专家级优化内核的性能，这得益于团队对算法设计的精妙构思和对GPU架构特性的深入理解。
- **即时编译（JIT）**：DeepGEMM 使用轻量级的 JIT 模块，在运行时根据特定硬件和输入大小动态生成高度优化的代码，进一步提升性能。
- **密集和 MoE GEMM 支持**：该库不仅能够高效处理传统的密集矩阵乘法，还专门针对 MoE 模型中的 GEMM 运算进行了优化，能够满足不同类型模型的计算需求。

## DeepGEMM 的性能表现

DeepSeek 团队在 H800 GPU 上使用 NVCC 12.8 对 DeepGEMM 进行了全面测试，涵盖了 DeepSeek-V3/R1 推理中可能使用的各种矩阵形状（包括预填充和解码阶段，但不涉及张量并行）。测试结果显示，DeepGEMM 的计算性能最高可达 1358 TFLOPS，内存带宽峰值为 2668 GB/s。与基于 CUTLASS 3.6 的优化实现相比，性能提升幅度最高可达 2.7 倍。在分组 GEMM（MoE 模型）的连续性布局和掩码布局下，性能提升也超过 1.2 倍。

## 总结

DeepGEMM 的发布标志着 DeepSeek 在高效矩阵乘法计算领域的又一重要突破。该库不仅支持 FP8 低精度计算，还针对 MoE 模型进行了深度优化，显著提升了大模型训练和推理的效率。DeepSeek 未来还会带来哪些令人惊喜的开源项目呢？让我们一同期待 DeepSeek 在开源之路上的更多精彩表现。

## 参考资料

- deepseek-ai/DeepGEMM：https://github.com/deepseek-ai/DeepGEMM