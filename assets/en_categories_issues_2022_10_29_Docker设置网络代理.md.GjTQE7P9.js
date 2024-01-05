import{_ as l}from"./chunks/ArticleMetadata.Sb1DYAHo.js";import{_ as p,D as r,o as t,c,I as d,w as h,k as i,a as k,R as m,b as g,e as u}from"./chunks/framework.FVQzxbLi.js";import"./chunks/md5.RtphNWHi.js";const y="/assets/202210291930211.n8F_zSQS.png",S=JSON.parse('{"title":"Docker 设置网络代理","description":"","frontmatter":{"title":"Docker 设置网络代理","author":"查尔斯","date":"2022/10/29 19:50","categories":["Bug万象集"],"tags":["Docker","Linux","CentOS","网络代理"]},"headers":[],"relativePath":"en/categories/issues/2022/10/29/Docker设置网络代理.md","filePath":"en/categories/issues/2022/10/29/Docker设置网络代理.md","lastUpdated":1704466962000}'),F={name:"en/categories/issues/2022/10/29/Docker设置网络代理.md"},_=i("h1",{id:"docker-设置网络代理",tabindex:"-1"},[k("Docker 设置网络代理 "),i("a",{class:"header-anchor",href:"#docker-设置网络代理","aria-label":'Permalink to "Docker 设置网络代理"'},"​")],-1),v=m('<h2 id="问题描述" tabindex="-1">问题描述 <a class="header-anchor" href="#问题描述" aria-label="Permalink to &quot;问题描述&quot;">​</a></h2><p><strong>C：</strong> 今天笔者在公司的一台内网服务器上，打算用 docker-compose 拉起一套开发环境。结果刚回车完命令就报错了。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">docker-compose</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> up</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -d</span></span></code></pre></div><p><img src="'+y+`" alt="202210291930211"></p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span>Error response from daemon: Get &quot;https://registry-1.docker.io/v2/&quot;: x509: certificate signed by unknown authority</span></span></code></pre></div><p>然后笔者又试了试 <code>docker pull</code>、<code>docker search</code> 这些命令，也都报这个错误。</p><h2 id="原因分析" tabindex="-1">原因分析 <a class="header-anchor" href="#原因分析" aria-label="Permalink to &quot;原因分析&quot;">​</a></h2><p>从报错提示上来看的话，笔者有两个怀疑的可能性：</p><ol><li>SSL 证书的问题</li><li>网络问题</li></ol><p>第 1 个怀疑主要是因为后面的提示部分：certificate signed by unknown authority，而且简单去搜了一下，确实有一些解决方案是冲着这个点解决的。</p><p>第 2 个怀疑主要是因为前面的提示部分：Error response from daemon，前文已经提过了，这是一台内网机器，内网机器这个身份基本可以表明它本身是没有网络的，能上网也是因为设置了网络代理的原因。而且，笔者之前也记录过一个问题，那个问题产生的原因就是系统服务不会识别 <code>/etc/profile</code> 中设置的环境变量，docker 也是一种系统服务，所以这让笔者更倾向于是这种可能。</p><h2 id="解决方案" tabindex="-1">解决方案 <a class="header-anchor" href="#解决方案" aria-label="Permalink to &quot;解决方案&quot;">​</a></h2><p>既然有过类似的经验，那肯定就按之前的经验先操作一下试试。</p><div class="tip custom-block"><p class="custom-block-title">笔者说</p><p>摊牌吧，两种可能，笔者都搜了。但笔者太懒了，看了看第 1 种可能的解决方案步骤，实在懒得去操作试试。所以又去简单搜了一下 Docker 网络代理的设置，意外发现它的解决方案和笔者刚才提到记录过的问题解决方案一样，这也让笔者确定了问题的原因。</p></div><p>首先，停止 docker 服务。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> stop</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> docker</span></span></code></pre></div><p>然后，创建 docker 服务目录，并创建 HTTP 代理配置文件。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">mkdir</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /etc/systemd/system/docker.service.d</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">vi</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /etc/systemd/system/docker.service.d/http-proxy.conf</span></span></code></pre></div><p>将下方配置贴到 HTTP 代理配置文件中，是的没错，就是添加了两个环境变量，这两个环境变量在 <code>/etc/profile</code> 中也设置过，详情见之前笔者记录过的一篇设置网络代理的文章。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">[Service]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Environment</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;HTTP_PROXY=http://用户名:密码@你的代理服务器地址:你的代理服务器端口号&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">Environment</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;HTTPS_PROXY=http://用户名:密码@你的代理服务器地址:你的代理服务器端口号&quot;</span></span></code></pre></div><p>最后，重新加载服务配置，重启服务。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> daemon-reload</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">systemctl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> restart</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> docker</span></span></code></pre></div><p>OK，再执行 docker 命令就没问题了。</p><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ol><li>Control Docker with systemd#Custom Docker daemon options 之 HTTP/HTTPS proxy：<a href="https://docs.docker.com/config/daemon/systemd/#httphttps-proxy" target="_blank" rel="noreferrer">https://docs.docker.com/config/daemon/systemd/#httphttps-proxy</a></li></ol><div class="tip custom-block"><p class="custom-block-title">笔者说</p><p>这里提一下，官方文档真的很香。</p></div>`,26);function b(s,C,D,f,T,P){const o=l,n=r("ClientOnly");return t(),c("div",null,[_,d(n,null,{default:h(()=>{var e,a;return[(((e=s.$frontmatter)==null?void 0:e.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(t(),g(o,{key:0,article:s.$frontmatter},null,8,["article"])):u("",!0)]}),_:1}),v])}const B=p(F,[["render",b]]);export{S as __pageData,B as default};
