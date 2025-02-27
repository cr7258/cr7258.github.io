import{_ as h}from"./chunks/ArticleMetadata.BeLu8q3j.js";import{_ as k,C as r,c as d,o as p,k as l,G as C,P as g,a as o,w as A,b as c,e as y}from"./chunks/framework.BhFhJsV2.js";import"./chunks/md5.DoUKmYou.js";const _=JSON.parse('{"title":"DeepSeek 开源周第四弹：DualPipe 和 EPLB —— 优化并行策略","description":"","frontmatter":{"title":"DeepSeek 开源周第四弹：DualPipe 和 EPLB —— 优化并行策略","author":"Se7en","date":"2025/02/26 21:30","categories":["AI"],"tags":["DeepSeek","AI"]},"headers":[],"relativePath":"blogs/original/2025/10-deepseek-parallelism.md","filePath":"blogs/original/2025/10-deepseek-parallelism.md","lastUpdated":1740662004000}'),D={name:"blogs/original/2025/10-deepseek-parallelism.md"};function B(i,s,u,F,m,E){const n=h,t=r("ClientOnly");return p(),d("div",null,[s[0]||(s[0]=l("h1",{id:"deepseek-开源周第四弹-dualpipe-和-eplb-——-优化并行策略",tabindex:"-1"},[o("DeepSeek 开源周第四弹：DualPipe 和 EPLB —— 优化并行策略 "),l("a",{class:"header-anchor",href:"#deepseek-开源周第四弹-dualpipe-和-eplb-——-优化并行策略","aria-label":'Permalink to "DeepSeek 开源周第四弹：DualPipe 和 EPLB —— 优化并行策略"'},"​")],-1)),C(t,null,{default:A(()=>{var a,e;return[(((a=i.$frontmatter)==null?void 0:a.aside)??!0)&&(((e=i.$frontmatter)==null?void 0:e.showArticleMetadata)??!0)?(p(),c(n,{key:0,article:i.$frontmatter},null,8,["article"])):y("",!0)]}),_:1}),s[1]||(s[1]=g(`<p>欢迎回到 DeepSeek 开源周！今天是第 4 天，我们将深入探讨优化并行策略（Optimized Parallelism Strategies）。如果你一直在关注 DeepSeek 的进展，你会知道这一周他们已经陆续推出了许多强大的开源工具。而今天，DeepSeek 带来了两项令人兴奋的创新：<a href="https://github.com/deepseek-ai/DualPipe" target="_blank" rel="noreferrer">DualPipe</a> 和 <a href="https://github.com/deepseek-ai/eplb" target="_blank" rel="noreferrer">EPLB</a>，这两者旨在解决训练大型 AI 模型时的速度、效率和可扩展性问题。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502272103694.png" alt=""></p><h2 id="为什么优化并行策略至关重要" tabindex="-1">为什么优化并行策略至关重要？ <a class="header-anchor" href="#为什么优化并行策略至关重要" aria-label="Permalink to &quot;为什么优化并行策略至关重要？&quot;">​</a></h2><p>在大模型训练中，计算与通信的效率瓶颈始终是开发者面临的重大挑战。例如：</p><ul><li>流水线气泡问题：传统流水线并行中，GPU 常因等待前序计算或通信而处于空闲状态，导致资源浪费；</li><li>负载不均衡：在专家并行（EP）架构中，不同 GPU 上的专家模块可能因任务需求不同而产生负载差异，影响整体训练速度；</li><li>通信开销：跨节点数据传输的延迟会显著拖慢分布式训练的效率，尤其是在混合专家模型（MoE）中。</li></ul><p>而 DeepSeek 发布的 DualPipe（一种双向流水线并行算法）和 EPLB（一种转为 MoE 设计的负载均衡器），极大优化了大规模 AI 训练的方式。</p><h2 id="dualpipe-双向流水线并行算法" tabindex="-1">DualPipe：双向流水线并行算法 <a class="header-anchor" href="#dualpipe-双向流水线并行算法" aria-label="Permalink to &quot;DualPipe：双向流水线并行算法&quot;">​</a></h2><p>DualPipe 是在 DeepSeek-V3 技术报告中提出的一种创新性双向流水线并行算法。它通过实现前向和后向计算与通信阶段的完全重叠，减少了流水线中的空闲时间（即“气泡”），从而显著提升硬件资源的利用率。在传统的流水线并行方法中，前向和后向计算通常是串行进行的，这导致了资源的浪费和训练效率的降低。DualPipe 通过双向调度策略，使得前向和后向计算可以在不同的 GPU 上同时进行，实现了计算与通信的完全重叠。这种方法不仅提高了训练速度，还降低了内存峰值需求。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502272056744.png" alt=""></p><p>上图展示了 DualPipe 在 8 个流水线阶段和 20 个微批次下的调度示意图。正向和反向的微批次在不同方向上对称分布，实现了计算与通信的完全重叠。</p><h2 id="eplb-专家并行负载均衡器" tabindex="-1">EPLB：专家并行负载均衡器 <a class="header-anchor" href="#eplb-专家并行负载均衡器" aria-label="Permalink to &quot;EPLB：专家并行负载均衡器&quot;">​</a></h2><p>在混合专家（MoE）模型中，不同专家的负载可能会因输入数据的变化而不均衡，导致某些 GPU 过载，而其他 GPU 闲置。为了解决这一问题，DeepSeek 推出了专家并行负载均衡器（EPLB）。EPLB 通过复制高负载的专家，并采用启发式算法将这些复制的专家合理分配到各个 GPU 上，以实现负载的均衡分布。此外，EPLB 结合了 DeepSeek-V3 中的组内限制专家路由策略，尽量将同一组的专家放置在同一节点内，以减少跨节点的数据传输开销。</p><p>下面的代码演示了一个两层 MoE 模型的示例，每一层包含 12 个专家。每层引入 4 个冗余专家，总共 16 个副本放置在 2 个节点上，每个节点包含 4 个 GPU。</p><div class="language-python vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">python</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> torch</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> eplb</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">weight </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> torch.tensor([[ </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">90</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">132</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">40</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">61</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">104</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">165</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">39</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,   </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">73</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">56</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">183</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">86</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">                       [ </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">20</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">107</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">104</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">19</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">197</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">187</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">157</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">172</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">86</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,  </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">27</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">]])</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">num_replicas </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 16</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">num_groups </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">num_nodes </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">num_gpus </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 8</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">phy2log, log2phy, logcnt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> eplb.rebalance_experts(weight, num_replicas, num_groups, num_nodes, num_gpus)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">print</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(phy2log)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># Output:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># tensor([[ 5,  6,  5,  7,  8,  4,  3,  4, 10,  9, 10,  2,  0,  1, 11,  1],</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">#         [ 7, 10,  6,  8,  6, 11,  8,  9,  2,  4,  5,  1,  5,  0,  3,  1]])</span></span></code></pre></div><p>由分层负载均衡策略生成的输出显示了以下专家复制与放置方案。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502272058627.png" alt=""></p><h2 id="deepseek-是怎么整合这一切的" tabindex="-1">DeepSeek 是怎么整合这一切的？ <a class="header-anchor" href="#deepseek-是怎么整合这一切的" aria-label="Permalink to &quot;DeepSeek 是怎么整合这一切的？&quot;">​</a></h2><p>放眼全局，DeepSeek 正在构建一套完整的工具，旨在优化 AI 训练管道的各个层面。从 FlashMLA 在 Hopper GPU 上加速解码，到 DeepGEMM 优化矩阵运算，再到 DualPipe 和 EPLB 提供并行计算与负载均衡，这些工具共同组成了一套完善的 AI 训练优化策略。</p><p>本质上，DeepSeek 正在打造一个生态系统，在这个系统中，计算、通信和负载均衡完美协同工作。无论是训练小型模型还是扩展到超大规模模型，这些工具都能无缝集成到你的工作流程中，在每个阶段提升性能。</p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>开源周的第 4 天，DeepSeek 带来了 DualPipe 和 EPLB，两项专为大模型训练优化的并行策略。DeepSeek 所做的不仅仅是发布一些很酷的工具。他们正在为 AI 开发树立新的标准，向世界展示开源协作如何推动有意义的进步。通过使这些优化的并行策略对所有人可用，他们降低了进入尖端 AI 的门槛，即使是预算较小或基础设施有限的团队也能参与其中。</p><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li>deepseek-ai/DualPipe：<a href="https://github.com/deepseek-ai/DualPipe" target="_blank" rel="noreferrer">https://github.com/deepseek-ai/DualPipe</a></li><li>deepseek-ai/eplb：<a href="https://github.com/deepseek-ai/eplb" target="_blank" rel="noreferrer">https://github.com/deepseek-ai/eplb</a></li></ul>`,23))])}const S=k(D,[["render",B]]);export{_ as __pageData,S as default};
