import{_ as i,c as a,o as n,P as l}from"./chunks/framework.DYYIy-hD.js";const A=JSON.parse('{"title":"设计模式","description":"","frontmatter":{"title":"设计模式","author":"Se7en","categories":["Programming","Design Pattern"],"tags":["Design Pattern"]},"headers":[],"relativePath":"categories/learning/编程语言/03-design-pattern.md","filePath":"categories/learning/编程语言/03-design-pattern.md","lastUpdated":1732242106000}'),h={name:"categories/learning/编程语言/03-design-pattern.md"};function t(p,s,k,e,r,d){return n(),a("div",null,s[0]||(s[0]=[l(`<h2 id="创建型模式" tabindex="-1">创建型模式 <a class="header-anchor" href="#创建型模式" aria-label="Permalink to &quot;创建型模式&quot;">​</a></h2><h3 id="单例模式-singleton" tabindex="-1">单例模式（Singleton） <a class="header-anchor" href="#单例模式-singleton" aria-label="Permalink to &quot;单例模式（Singleton）&quot;">​</a></h3><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202411051557458.png" alt=""></p><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">sync</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">//Singleton 是单例模式类</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Singleton</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">{}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> singleton </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Singleton</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> once sync.Once</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">//GetInstance 用于获取单例模式对象</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> GetInstance</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Singleton {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	once.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">Do</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">		singleton </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Singleton{}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">	return</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> singleton</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><h3 id="创建者模式-builder" tabindex="-1">创建者模式（Builder） <a class="header-anchor" href="#创建者模式-builder" aria-label="Permalink to &quot;创建者模式（Builder）&quot;">​</a></h3><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202411051607576.png" alt=""></p><div class="language-go vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">go</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Builder</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> interface</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">	Part1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">	Part2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">	Part3</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Director</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	builder Builder</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> NewDirector</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(builder Builder) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Director {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">	return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Director{</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">		builder: builder,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (d </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Director) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Construct</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	d.builder.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">Part1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	d.builder.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">Part2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	d.builder.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">Part3</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Builder1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder1) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;1&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder1) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;2&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder1) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part3</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;3&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder1) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">GetResult</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">	return</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> b.result</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Builder2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> struct</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">int</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder2) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder2) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder2) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">Part3</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">	b.result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">+=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">func</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Builder2) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">GetResult</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">	return</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> b.result</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li><a href="https://github.com/ssbandjl/golang-design-pattern" target="_blank" rel="noreferrer">golang-design-pattern</a></li><li><a href="https://space.bilibili.com/373073810/channel/collectiondetail?sid=734579&amp;spm_id_from=333.788.0.0" target="_blank" rel="noreferrer">Easy搞定Golang设计模式(学Go语言设计模式，如此简单!)</a></li></ul>`,9)]))}const y=i(h,[["render",t]]);export{A as __pageData,y as default};
