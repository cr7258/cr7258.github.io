---
title: AI 知识点 | Transformer 中的 Q、K、V 是什么意思？
author: Se7en
date: 2025/05/20 20:00
categories:
 - AI
tags:
 - AI
 - Transformer
---

# AI 知识点 | Transformer 中的 Q、K、V 是什么意思？

## Embedding

## Similarity



$W^Q$、$W^K$、$W^V$ 就是 Transformer 大模型在预训练阶段时，通过神经网络反向传播来训练出来的权重矩阵（注意，这里提到的“权重”，是指神经网络中的连接权重，与 Attention 中 token 之间的语义关联权重不是一个意思）。


很多人会在这里感觉很迷惑，$W^Q$、$W^K$、$W^V$ 这三个矩阵到底是从何而来的，因为很多介绍 Transformer 的文章在这里都只是一笔带过，仅仅说了一下 
 ，
，
 这三个权重矩阵是随机初始化的，但并没有说明是在模型“训练阶段”随机初始化的，这造成了诸多的混淆。因为，不同于“训练阶段”，在模型的“执行阶段”（模型预测阶段）这三个矩阵是固定的，即 Transformer 神经网络架构中的固定的节点连接权重，是早就被预先训练好的了（Pre-Trained）。比如说大家耳熟能详的 GPT ，就是 Generative Pre-Trained Transformer。

为什么除以  $\sqrt{d_k}$


当 Query 和 Key 的维度 $d_k$ 较大时，点积的数值会变得很大，导致 softmax 的输出趋近于 0 或 1，进入“饱和区域”。在这种情况下，softmax 的梯度会变得非常小，模型几乎无法更新参数，从而使训练变得困难。为了解决这个问题，Transformer 将点积除以 $\sqrt{d_k}$，使数值保持在合理范围内，避免梯度消失。


## 参考资料

- DeepLearning.AI Attention in Transformers: Concepts and Code in PyTorch：https://learn.deeplearning.ai/courses/attention-in-transformers-concepts-and-code-in-pytorch/lesson/gb20l/the-matrix-math-for-calculating-self-attention
- DeepLearning.AI How Transformer LLMs Work - Self Attention: https://learn.deeplearning.ai/courses/how-transformer-llms-work/lesson/bpx95/self-attention
- Attention is all you need (Transformer) - Model explanation (including math), Inference and Training：https://www.youtube.com/watch?v=bCz4OMemCcA
- The Illustrated Transformer：https://jalammar.gßithub.io/illustrated-transformer/
- Transformers (how LLMs work) explained visually | DL5：https://www.youtube.com/watch?v=wjZofJX0v4M
- The Attention Mechanism in Large Language Models：https://www.youtube.com/watch?v=OxCpWwDCDFQ
- The math behind Attention: Keys, Queries, and Values matrices：https://www.youtube.com/watch?v=UPtG_38Oq8o
- What are Transformer Models and how do they work?：https://www.youtube.com/watch?v=qaWMOYf4ri8
- What Are Transformer Models and How Do They Work?：https://cohere.com/llmu/what-are-transformer-models
- What Is Attention in Language Models?：https://cohere.com/llmu/what-is-attention-in-language-models
- Transformer模型详解（图解最完整版）：https://zhuanlan.zhihu.com/p/338817680
- Transformer 里的 Q K V 是什么：https://blog.cnbang.net/tech/3934/
- 探秘Transformer系列之（1）：注意力机制：https://www.cnblogs.com/rossiXYZ/p/18705809
- 从人脑到Transformer：轻松理解注意力机制中的QKV：https://zhuanlan.zhihu.com/p/688660519
- Multi-Head Attention的QKV是什么：https://www.bilibili.com/video/BV1Zu4m1u75U
- Attention的QKV输出的到底是什么？：https://www.bilibili.com/video/BV1Wi421o7RX
- Transformer Attention的QKV完结篇：https://www.bilibili.com/video/BV1Nx42117h
- Self-Attention通过线性变换计算Q K V的原理：https://www.hwzhao.cn/pages/1fccc0/
