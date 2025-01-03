import{_ as l}from"./chunks/ArticleMetadata.Yw6SSleQ.js";import{_ as r,D as h,o as e,c as o,I as k,w as c,k as n,a as d,R as F,b as u,e as g}from"./chunks/framework.FHZ5yb6k.js";import"./chunks/md5.0oexlRJv.js";const O=JSON.parse('{"title":"AI","description":"","frontmatter":{"title":"AI","author":"Se7en","categories":["AI"],"tags":["AI","Open Source"]},"headers":[],"relativePath":"categories/open-source/开源项目/01-ai.md","filePath":"categories/open-source/开源项目/01-ai.md","lastUpdated":1735907741000}'),y={name:"categories/open-source/开源项目/01-ai.md"},m=n("h1",{id:"ai",tabindex:"-1"},[d("AI "),n("a",{class:"header-anchor",href:"#ai","aria-label":'Permalink to "AI"'},"​")],-1),C=F(`<h2 id="ai-代理" tabindex="-1">AI 代理 <a class="header-anchor" href="#ai-代理" aria-label="Permalink to &quot;AI 代理&quot;">​</a></h2><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501032030701.png" alt=""></p><p>参考资料：</p><ul><li><a href="https://www.xiaogenban1993.com/blog/24.09/llm%E4%BE%9B%E5%BA%94%E5%95%86" target="_blank" rel="noreferrer">LLM供应商</a></li></ul><h3 id="openrouter" tabindex="-1">OpenRouter <a class="header-anchor" href="#openrouter" aria-label="Permalink to &quot;OpenRouter&quot;">​</a></h3><p>OpenRouter 是一个统一的 API 服务平台，旨在通过单一接口为用户提供对多种大型语言模型（LLM）的访问。</p><p>该平台支持多种知名模型，包括 OpenAI 的 GPT-3.5 和 GPT-4、Anthropic 的 Claude 系列、Meta 的 LLaMA 系列、Google 的 Gemini 系列等。</p><p>闭源模型如 GPT 是和 <a href="https://openai.com/api/pricing/" target="_blank" rel="noreferrer">OpenAI 的官网价格</a>一致甚至更低，并且已经提供了最新的 o1 模型了。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501032022759.png" alt=""></p><p>开源 llama3.1-70b 8K 上下文甚至免费，131K 上下文收费也仅有 0.12 美元/百万 token。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501032022920.png" alt=""></p><p><strong>使用方法</strong></p><p>请求的时候统一指定 OpenRouter 的地址：<a href="https://openrouter.ai" target="_blank" rel="noreferrer">https://openrouter.ai</a>，在 model 中指定模型名称，例如 <code>openai/gpt-3.5-turbo</code>、<code>anthropic/claude-3.5-haiku-20241022</code>，请求头和请求体统一使用 OpenAI 的格式。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://openrouter.ai/api/v1/chat/completions</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;Content-Type: application/json&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;Authorization: Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">OPENROUTER_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">}&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  &quot;model&quot;: &quot;openai/gpt-3.5-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      &quot;content&quot;: &quot;What is the meaning of life?&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">}&#39;</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://openrouter.ai/api/v1/chat/completions</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;Content-Type: application/json&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;Authorization: Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">OPENROUTER_API_KEY</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">}&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  &quot;model&quot;: &quot;anthropic/claude-3.5-haiku-20241022&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      &quot;content&quot;: &quot;What is the meaning of life?&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">}&#39;</span></span></code></pre></div><h2 id="screenpipe" tabindex="-1">Screenpipe <a class="header-anchor" href="#screenpipe" aria-label="Permalink to &quot;Screenpipe&quot;">​</a></h2><p>Screenpipe 是一款开源的 AI 工具，能够 24 小时不间断地记录您的屏幕和音频数据，并将其存储在本地数据库中。Screenpipe 通过结合大型语言模型（LLMs），可实现对您在电脑上所做事情的进行对话、总结和回顾。</p><p>参考资料：</p><ul><li><a href="https://docs.screenpi.pe/docs/examples" target="_blank" rel="noreferrer">Screenpipe use case examples</a></li><li><a href="https://docs.screenpi.pe/docs/plugins#available-pipes" target="_blank" rel="noreferrer">Screenpipe available pipes</a></li></ul>`,18);function _(s,q,A,D,f,b){const t=l,p=h("ClientOnly");return e(),o("div",null,[m,k(p,null,{default:c(()=>{var a,i;return[(((a=s.$frontmatter)==null?void 0:a.aside)??!0)&&(((i=s.$frontmatter)==null?void 0:i.showArticleMetadata)??!0)?(e(),u(t,{key:0,article:s.$frontmatter},null,8,["article"])):g("",!0)]}),_:1}),C])}const E=r(y,[["render",_]]);export{O as __pageData,E as default};
