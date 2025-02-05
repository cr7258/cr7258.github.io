import{_ as i,c as a,o as n,P as e}from"./chunks/framework.DYYIy-hD.js";const c=JSON.parse('{"title":"内存","description":"","frontmatter":{"title":"内存","author":"Se7en","categories":["Interview"],"tags":["Operating System","Memory"]},"headers":[],"relativePath":"courses/interview/操作系统/02-memory.md","filePath":"courses/interview/操作系统/02-memory.md","lastUpdated":1729736003000}'),l={name:"courses/interview/操作系统/02-memory.md"};function t(p,s,h,r,k,g){return n(),a("div",null,s[0]||(s[0]=[e(`<h2 id="hugepages-是什么-用来解决什么问题" tabindex="-1">HugePages 是什么？用来解决什么问题？ <a class="header-anchor" href="#hugepages-是什么-用来解决什么问题" aria-label="Permalink to &quot;HugePages 是什么？用来解决什么问题？&quot;">​</a></h2><p><strong>TL;DR 使用 HugePages 的好处</strong>：</p><ul><li><strong>减少 TLB（Translation Lookaside Buffer）的失效情况。</strong></li><li><strong>减少页表的内存消耗。</strong></li><li><strong>减少 PageFault（缺页中断）的次数。</strong> 缺页中断指的是当进程访问的虚拟地址在页表中查不到时，系统会产生一个缺页异常，进入内核空间分配物理内存、更新进程页表，最后再返回用户空间，恢复进程的运行。</li></ul><p>在介绍 HugePages 之前，我们先来回顾一下 Linux 下虚拟内存与物理内存之间的关系。</p><ul><li>物理内存：也就是安装在计算机中的内存条，比如安装了 2GB 大小的内存条，那么物理内存地址的范围就是 0 ~ 2GB。</li><li>虚拟内存：虚拟的内存地址。由于 CPU 只能使用物理内存地址，所以需要将虚拟内存地址转换为物理内存地址才能被 CPU 使用，这个转换过程由 MMU（Memory Management Unit，内存管理单元） 来完成。在 32 位的操作系统中，虚拟内存空间大小为 0 ~ 4GB。</li><li>TLB （Translation Lookaside Buffer，转译后备缓冲器）是一块高速缓存，TLB 缓存虚拟内存地址与其映射的物理内存地址。MMU 首先从 TLB 查找内存映射的关系，如果找到就不用回溯查找页表。否则，只能根据虚拟内存地址，去页表中查找其映射的物理内存地址。</li></ul><p>如下图所示，页表保存的是虚拟内存地址与物理内存地址的映射关系，MMU 从 页表中找到虚拟内存地址所映射的物理内存地址，然后把物理内存地址提交给 CPU，这个过程与 Hash 算法相似。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410190943096.png" alt=""></p><p>不过要注意，MMU 并不以字节为单位来管理内存，而是规定了一个内存映射的最小单位，也就是页，通常是 4 KB 大小。这样，每一次内存映射，都需要关联 4 KB 或者 4KB 整数倍的内存空间。页的大小只有 4 KB ，导致的另一个问题就是，整个页表会变得非常大。比方说，仅 32 位系统就需要 100 多万个页表项（4GB/4KB），才可以实现整个地址空间的映射。为了解决页表项过多的问题，Linux 提供了两种机制，也就是<strong>多级页表</strong>和<strong>大页（HugePage）</strong>。</p><p>如果我们使用 Linux 中默认的 4KB 内存页，那么 CPU 在访问对应的内存时需要分别读取 PGD、PUD、PMD 和 PTE 才能获取物理内存。Linux 只使用了 64 位虚拟内存地址的前 48 位（0 ~ 47位），并且 Linux 把这 48 位虚拟内存地址分为 5 个部分，如下：</p><ul><li>PGD索引：39 ~ 47 位（共 9 位），指定在 页全局目录（PGD，Page Global Directory）中的索引。</li><li>PUD索引：30 ~ 38 位（共 9 位），指定在 页上级目录（PUD，Page Upper Directory）中的索引。</li><li>PMD索引：21 ~ 29 位（共 9 位），指定在 页中间目录（PMD，Page Middle Directory）中的索引。</li><li>PTE索引：12 ~ 20 位（共 9 位），指定在 页表（PT，Page Table）中的索引。</li><li>偏移量：0 ~ 11 位（共 12 位），指定在物理内存页中的偏移量。</li></ul><p>下图中的页表分为 4 级：页全局目录、页上级目录、页中间目录 和 页表，目的是为了减少内存消耗。页全局目录、页上级目录、页中间目录 和 页表 都占用一个 4KB 大小的物理内存页，由于 64 位内存地址占用 8 个字节，所以一个 4KB 大小的物理内存页可以容纳 512 个 64 位内存地址。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410190946426.png" alt=""></p><p>上面介绍了以 4KB 的内存页作为内存映射的单位，我们还可以使用更大的内存页（HugePages）作为映射单位，常见的大小有 2MB 和 1GB。</p><p>因为 2MB 的内存页占用了 21 位的地址，所以我们也不再需要五层页表中的 PTE 结构，这不仅能够减少翻译虚拟地址时访问页表的次数，还能够降低页表的内存占用。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191005579.png" alt=""></p><p>CPU 总可以通过上述复杂的目录结构找到虚拟页对应的物理页，但是每次翻译虚拟地址时都使用上述结构是非常昂贵的操作，操作系统使用 TLB 作为缓存来解决这个问题，TLB 是内存管理组件（Memory Management Unit）的一个部分，其中缓存的页表项可以帮助我们快速翻译虚拟地址：</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202410191007438.png" alt=""></p><p>更大的内存页面意味着更高的缓存命中率，因为 TLB 缓存的容量是一定的，它只能缓存指定数量的页面，在这种情况下，缓存 2MB 的大页能够为系统提高缓存的命中率，从而提高系统的整体性能。</p><p>除了较少页表项和提高缓存命中率之外，使用更大的页面还可以提高内存的访问效率，对于相同的 1GB 内存，使用 4KB 的内存页需要系统处理 262,144 次，但是使用 2MB 的大页却只需要 512 次，这可以将系统获取内存所需要的处理次数降低几个数量级。</p><p>参考资料：</p><ul><li><a href="https://draveness.me/whys-the-design-linux-hugepages/" target="_blank" rel="noreferrer">为什么 HugePages 可以提升数据库性能</a></li><li><a href="https://cloud.tencent.com/developer/article/1816836" target="_blank" rel="noreferrer">一文读懂 HugePages（大内存页）的原理</a></li><li><a href="https://kubernetes.io/zh-cn/docs/tasks/manage-hugepages/scheduling-hugepages/" target="_blank" rel="noreferrer">Kubernetes 官方文档：管理巨页（HugePage）</a></li><li><a href="https://time.geekbang.org/column/article/74272" target="_blank" rel="noreferrer">极客时间：15 | 基础篇：Linux内存是怎么工作的？</a></li></ul><h2 id="假如剩余内存-2g-malloc-100g-能成功吗" tabindex="-1">假如剩余内存 2G，malloc 100G 能成功吗？ <a class="header-anchor" href="#假如剩余内存-2g-malloc-100g-能成功吗" aria-label="Permalink to &quot;假如剩余内存 2G，malloc 100G 能成功吗？&quot;">​</a></h2><p>不能。如果系统中剩余的可用内存为 2G，而你请求分配 100G 的内存，malloc 会返回 NULL，表示内存分配失败。因为请求的内存大小超过了可用内存，通常内存分配器会检查当前可用的内存，并在分配之前确保足够的内存可用。可以运行以下代码进行测试：</p><div class="language-c vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">c</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// memory_test.cpp</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &lt;iostream&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">#include</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &lt;cstdlib&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">int</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> main</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">    // 申请 100 GB 内存, 实际只有 2 GB 内存</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    void*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> ptr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> malloc</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">LL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> *</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1024</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> *</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1024</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> *</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1024</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">); </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    </span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (ptr </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">==</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> nullptr) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">        std::cout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;内存分配失败&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> std::endl;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    </span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    std::cout </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;内存分配成功&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> std::endl;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">    free</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(ptr);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// 编译</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// g++ memory_test.cpp -o memory_test</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// 运行</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// ./memory_test</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// 返回结果：内存分配失败</span></span></code></pre></div><h2 id="内存被-free-掉-系统的可用内存会马上增加吗" tabindex="-1">内存被 free 掉，系统的可用内存会马上增加吗？ <a class="header-anchor" href="#内存被-free-掉-系统的可用内存会马上增加吗" aria-label="Permalink to &quot;内存被 free 掉，系统的可用内存会马上增加吗？&quot;">​</a></h2><p>不会。当调用 free 释放一块内存时，这块内存并不会立即归还给操作系统，而是被标记为可用并加入到空闲链表中。这意味着在短期内，系统的可用内存量不会增加，直到有其他请求需要使用这块释放的内存时，才会从空闲链表中重新分配给新的请求。</p><p>参考资料：</p><ul><li><a href="https://yuhao0102.github.io/2019/04/24/%E7%90%86%E8%A7%A3glibc_malloc_%E4%B8%BB%E6%B5%81%E7%94%A8%E6%88%B7%E6%80%81%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E5%99%A8%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86/" target="_blank" rel="noreferrer">理解 glibc malloc：主流用户态内存分配器实现原理</a></li></ul>`,28)]))}const d=i(l,[["render",t]]);export{c as __pageData,d as default};
