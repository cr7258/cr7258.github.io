import{_ as r,c as t,o as a,P as o}from"./chunks/framework.DYYIy-hD.js";const b=JSON.parse('{"title":"eBPF 基础","description":"","frontmatter":{"title":"eBPF 基础","author":"Se7en","categories":["eBPF"],"tags":["eBPF"]},"headers":[],"relativePath":"categories/learning/eBPF/01-ebpf.md","filePath":"categories/learning/eBPF/01-ebpf.md","lastUpdated":1738332880000}'),i={name:"categories/learning/eBPF/01-ebpf.md"};function n(l,e,p,h,s,d){return a(),t("div",null,e[0]||(e[0]=[o('<h2 id="ebpf-学习资料" tabindex="-1">eBPF 学习资料 <a class="header-anchor" href="#ebpf-学习资料" aria-label="Permalink to &quot;eBPF 学习资料&quot;">​</a></h2><table><thead><tr><th>资料</th><th>描述</th></tr></thead><tbody><tr><td><a href="https://docs.cilium.io/en/stable/reference-guides/bpf/" target="_blank" rel="noreferrer">BPF and XDP Reference Guide</a></td><td>Cilium 官方编写的 eBPF 参考指南</td></tr><tr><td><a href="https://docs.ebpf.io/" target="_blank" rel="noreferrer">eBPF Docs</a></td><td>eBPF 社区的公共知识库，包含各种 eBPF 映射、 eBPF 程序类型以及 eBPF 帮助函数的详细说明</td></tr><tr><td><a href="https://www.youtube.com/@eBPFCilium" target="_blank" rel="noreferrer">eBPF &amp; Cilium Community</a></td><td>ebpf.io 的 YouTube 频道，包含 eCHO Episode 和 eBPF summit 的视频</td></tr><tr><td><a href="https://eunomia.dev/zh/tutorials/" target="_blank" rel="noreferrer">eBPF 开发实践教程</a></td><td>包含 40+ eBPF 教程以及配套代码</td></tr><tr><td><a href="https://time.geekbang.org/dashboard/course" target="_blank" rel="noreferrer">eBPF核心技术与实战</a></td><td>极客时间 eBPF 教程</td></tr><tr><td><a href="https://mostlynerdless.de/blog/tag/hello-ebpf/" target="_blank" rel="noreferrer">BuildingJohannes Bechberger 的博客</a></td><td>主要介绍使用 Java 来编写 eBPF 程序</td></tr><tr><td><a href="https://arthurchiao.art/blog/bpf-advanced-notes-1-zh/" target="_blank" rel="noreferrer">BPF 进阶笔记</a></td><td>包含 eBPF 类型讲解、eBPF 映射类型、调试 eBPF 程序等内容</td></tr></tbody></table><h2 id="core-compile-once-–-run-everywhere" tabindex="-1">CORE（Compile Once – Run Everywhere） <a class="header-anchor" href="#core-compile-once-–-run-everywhere" aria-label="Permalink to &quot;CORE（Compile Once – Run Everywhere）&quot;">​</a></h2><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202412022206044.png" alt=""></p><p>由于 vmlinux.h 文件是由当前运行内核生成的，如果你试图将编译好的 eBPF 程序在另一台运行不同内核版本的机器上运行，可能会面临崩溃的窘境。这主要是因为在不同的版本中，对应数据类型的定义可能会在 Linux 源代码中发生变化。</p><p>但是，通过使用 libbpf 库提供的功能可以实现 “CO:RE”（一次编译，到处运行）。libbpf 库定义了部分宏（比如 BPF_CORE_READ），其可分析 eBPF 程序试图访问 vmlinux.h 中定义的类型中的哪些字段。如果访问的字段在当前内核定义的结构中发生了移动，宏 / 辅助函数会协助自动找到对应字段【译者注：对于可能消失的字段，也提供了对应的辅助函数 bpf_core_field_exists】。因此，我们可以使用当前内核中生成的 vmlinux.h 头文件来编译 eBPF 程序，然后在不同的内核上运行它【译者注：需要运行的内核也支持 BTF 内核编译选项】。</p><p><a href="https://www.ebpf.top/post/intro_vmlinux_h/" target="_blank" rel="noreferrer">https://www.ebpf.top/post/intro_vmlinux_h/</a></p><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><p><a href="https://nakryiko.com/posts/libbpf-bootstrap/" target="_blank" rel="noreferrer">Building BPF applications with libbpf-bootstrap</a></p></li><li><p><a href="https://nakryiko.com/posts/bpf-core-reference-guide/" target="_blank" rel="noreferrer">BPF CO-RE reference guide</a></p></li><li><p><a href="https://nakryiko.com/posts/bpf-portability-and-co-re/" target="_blank" rel="noreferrer">BPF CO-RE (Compile Once – Run Everywhere)</a></p></li><li><p><a href="https://zhuanlan.zhihu.com/p/555362934" target="_blank" rel="noreferrer">Eunomia: 让 ebpf 程序的分发和使用像网页和 web 服务一样自然</a></p></li><li><p><a href="https://www.bilibili.com/video/BV1DG4y1N76m" target="_blank" rel="noreferrer">eunomia-bpf: 一个开源的 ebpf 动态加载运行时和开发工具链</a></p></li><li><p><a href="https://arthurchiao.art/blog/bpf-ringbuf-zh/" target="_blank" rel="noreferrer">[译] BPF ring buffer：使用场景、核心设计及程序示例（2020）</a></p></li></ul>',9)]))}const c=r(i,[["render",n]]);export{b as __pageData,c as default};
