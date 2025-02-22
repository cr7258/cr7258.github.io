import{_ as h}from"./chunks/ArticleMetadata.BeLu8q3j.js";import{_ as k,C as F,c as o,o as t,k as p,G as r,P as d,a as g,w as c,b as C,e as y}from"./chunks/framework.BhFhJsV2.js";import"./chunks/md5.DoUKmYou.js";const I=JSON.parse('{"title":"提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍","description":"","frontmatter":{"title":"提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍","author":"Se7en","date":"2025/01/22 22:30","categories":["AI"],"tags":["Higress","AI"]},"headers":[],"relativePath":"blogs/original/2025/06-higress-ai-gateway.md","filePath":"blogs/original/2025/06-higress-ai-gateway.md","lastUpdated":1740232649000}'),u={name:"blogs/original/2025/06-higress-ai-gateway.md"};function q(i,s,D,A,m,B){const l=h,e=F("ClientOnly");return t(),o("div",null,[s[0]||(s[0]=p("h1",{id:"提升-ai-服务的稳定性-higress-ai-网关的降级功能介绍",tabindex:"-1"},[g("提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍 "),p("a",{class:"header-anchor",href:"#提升-ai-服务的稳定性-higress-ai-网关的降级功能介绍","aria-label":'Permalink to "提升 AI 服务的稳定性：Higress AI 网关的降级功能介绍"'},"​")],-1)),r(e,null,{default:c(()=>{var a,n;return[(((a=i.$frontmatter)==null?void 0:a.aside)??!0)&&(((n=i.$frontmatter)==null?void 0:n.showArticleMetadata)??!0)?(t(),C(l,{key:0,article:i.$frontmatter},null,8,["article"])):y("",!0)]}),_:1}),s[1]||(s[1]=d(`<p>在使用 LLM 服务时，服务的稳定性和可用性至关重要。然而，由于网络问题、服务器故障或其他不可控因素，LLM 服务可能会暂时不可用。为了保障用户体验和业务连续性，Higress AI 网关提供了强大的模型降级和令牌降级功能。本文将介绍这两个关键功能，并展示它们如何为 AI 应用提供可靠的服务保障。</p><h2 id="一键启动-higress-ai-网关" tabindex="-1">一键启动 Higress AI 网关 <a class="header-anchor" href="#一键启动-higress-ai-网关" aria-label="Permalink to &quot;一键启动 Higress AI 网关&quot;">​</a></h2><p>首先启动 Higress AI 网关，仅需一行命令，即可快速在本地搭建好 Higress AI 网关（此步骤需要有 Docker 环境）：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -sS</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://higress.cn/ai-gateway/install.sh</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> bash</span></span></code></pre></div><p>执行以上命令后，会进入引导界面，可以在此处配置 Provider 的 ApiToken，也可以输入回车直接跳过：</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222156467.png" alt=""></p><p>看到以下界面就表示 Higress AI 网关已经成功启动了。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222201154.png" alt=""></p><p>浏览器输入 <a href="http://localhost:8001" target="_blank" rel="noreferrer">http://localhost:8001</a> 就可以访问 Higress 的控制台界面了。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222202304.png" alt=""></p><h2 id="配置-apitoken" tabindex="-1">配置 ApiToken <a class="header-anchor" href="#配置-apitoken" aria-label="Permalink to &quot;配置 ApiToken&quot;">​</a></h2><p>Higress AI 网关内置了主流的 LLM Provider，仅需要在控制台上简单填写 ApiToken 即可完成 Provider 的配置。这里我们分别配置 DeepSeek 和通义千问两个 Provider。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222205245.png" alt=""></p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222207821.png" alt=""></p><h2 id="请求-deepseek-和通义千问" tabindex="-1">请求 DeepSeek 和通义千问 <a class="header-anchor" href="#请求-deepseek-和通义千问" aria-label="Permalink to &quot;请求 DeepSeek 和通义千问&quot;">​</a></h2><p>配置完 ApiToken 以后，就可以直接通过 Higress AI 网关来访问 DeepSeek 和通义千问了。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 请求 DeepSeek</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;http://localhost:8080/v1/chat/completions&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;Content-Type: application/json&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;model&quot;: &quot;deepseek-chat&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;content&quot;: &quot;你是谁？&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      }&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 请求通义千问</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;http://localhost:8080/v1/chat/completions&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;Content-Type: application/json&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;model&quot;: &quot;qwen-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;content&quot;: &quot;你是谁？&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      }&#39;</span></span></code></pre></div><p>Higress AI 网关已经帮用户预先配置了 AI 路由，可以根据模型名称的前缀来路由到不同的 LLM。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501222216282.png" alt=""></p><h2 id="模型降级" tabindex="-1">模型降级 <a class="header-anchor" href="#模型降级" aria-label="Permalink to &quot;模型降级&quot;">​</a></h2><p>Higress AI 网关提供的模型降级（fallback）功能，能够在主 LLM 服务不可用时，自动切换到备选的 LLM 服务，确保业务连续性和用户体验不受影响。</p><p>接下来，我们将以通义千问作为主 LLM 服务，DeepSeek 作为备 LLM 服务进行演示。在 <code>AI 路由管理界面</code>中，选择通义千问预设的 AI 路由（aliyun），并启用降级配置。在降级服务选项中选择 <code>deepseek</code>，同时将目标模型设置为 <code>deepseek-chat</code>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502222050574.png" alt=""></p><p>在 <code>AI 服务提供者管理</code> 界面中，编辑通义千问的凭证（ApiToken），这里我们故意设置一个错误的凭证，以确保能够触发降级功能。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502172209381.png" alt=""></p><p>接下来，客户端向 Higress AI 网关发送请求，其中 <code>model</code> 设置为 <code>qwen-turbo</code>。以 <code>qwen-</code> 开头的模型将首先通过 AI 路由转发至通义千问。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 请求通义千问</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;http://localhost:8080/v1/chat/completions&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;Content-Type: application/json&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;model&quot;: &quot;qwen-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;content&quot;: &quot;你是谁？&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      }&#39;</span></span></code></pre></div><p>从响应内容可以看出，这个请求最终是由 DeepSeek 处理的，说明我们设置的模型降级功能已经生效。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 响应内容来自 DeepSeek</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;id&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;99ad1eed-2445-4722-a1e7-d9a9fb2a3b74&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;object&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;chat.completion&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;created&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1739801515</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;model&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;deepseek-chat&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;choices&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;index&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;message&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        &quot;role&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;assistant&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        &quot;content&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;您好！我是由中国的深度求索（DeepSeek）公司开发的智能助手DeepSeek-V3。如您有任何任何问题，我会尽我所能为您提供帮助。&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">      },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;logprobs&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> null,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;finish_reason&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;stop&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  ],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;usage&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;prompt_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 5</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;completion_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 37</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;total_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 42</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;prompt_tokens_details&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;cached_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;prompt_cache_hit_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;prompt_cache_miss_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;system_fingerprint&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;fp_3a5770e1b4&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><h2 id="令牌降级" tabindex="-1">令牌降级 <a class="header-anchor" href="#令牌降级" aria-label="Permalink to &quot;令牌降级&quot;">​</a></h2><p>除了模型降级功能，Higress AI 网关还提供了令牌降级功能。用户可以设置多个 ApiToken，Higress 默认会随机选择一个进行请求。如果某个 ApiToken 不可用，Higress 会将其从列表中移除，并在后台进行健康检查。一旦该令牌通过检查并恢复正常，它将被重新加入可用列表。这一机制进一步保障了服务的连续性，并确保了用户的良好体验。</p><p>在 <code>AI 服务提供者管理</code> 界面中，为通义千问模型启用令牌降级功能，将健康检测请求的模型设置为 <code>qwen-turbo</code>，其他参数保持默认不变。另外在凭证中分别设置一个可用的 ApiToken 和一个不可用的 ApiToken。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202502172155470.png" alt=""></p><p>接下来，客户端通过 Higress AI 网关向通义千问发送请求，可以多次尝试，你会发现始终能够收到来自通义千问的成功响应。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 请求通义千问</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;http://localhost:8080/v1/chat/completions&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -H</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;Content-Type: application/json&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      -d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;model&quot;: &quot;qwen-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;messages&quot;: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;role&quot;: &quot;user&quot;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">            &quot;content&quot;: &quot;你是谁？&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">          }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">      }&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 响应内容来自通义千问</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;id&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;09257759-00f2-9130-bfbb-799d2b430390&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;choices&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;index&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;message&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        &quot;role&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;assistant&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        &quot;content&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;我是阿里云开发的一款超大规模语言模型，我叫通义千问。&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">      },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">      &quot;finish_reason&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;stop&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  ],</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;created&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1739801612</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;model&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;qwen-turbo&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;object&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;chat.completion&quot;,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  &quot;usage&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;prompt_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 11</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;completion_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 17</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    &quot;total_tokens&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 28</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>由于<code>令牌不可用时需要满足的最小连续请求失败次数参数</code>默认设置为 1，如果首次请求时正好使用了不可用的 ApiToken，Higress 会立即将其从可用列表中移除。同时，默认情况下，Higress 会主动发起一次新的尝试。由于不可用的 ApiToken 已被移除，新的尝试将使用另一个可用的 ApiToken，因此无论尝试多少次，你始终可以收到成功的响应。</p><p>此外，令牌降级功能还可以与模型降级功能配合使用。例如，配置多个 ApiToken，当请求失败时，首先尝试使用另一个 ApiToken，如果仍然失败，再降级到备用 LLM，从而进一步提高系统的稳定性和可靠性。</p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>本文重点介绍了 Higress AI 网关的模型降级和令牌降级功能。在 LLM 服务不可用时，模型降级功能能自动切换到备用 LLM，确保业务连续性。而令牌降级功能则通过健康检查机制，自动移除不可用的 ApiToken，并在恢复后重新加入，从而提升服务的稳定性和用户体验。</p>`,39))])}const f=k(u,[["render",q]]);export{I as __pageData,f as default};
