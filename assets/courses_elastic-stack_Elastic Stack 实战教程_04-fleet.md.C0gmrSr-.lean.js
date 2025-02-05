import{_ as c}from"./chunks/ArticleMetadata.C05v4-uB.js";import{_ as g,C as h,c as r,o as n,k as e,G as o,P as d,a as k,w as u,b as y,e as F}from"./chunks/framework.DYYIy-hD.js";import"./chunks/md5.B246JoDV.js";const E=JSON.parse('{"title":"使用 Fleet 管理 Elastic Agent 监控应用","description":"","frontmatter":{"title":"使用 Fleet 管理 Elastic Agent 监控应用","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"]},"headers":[],"relativePath":"courses/elastic-stack/Elastic Stack 实战教程/04-fleet.md","filePath":"courses/elastic-stack/Elastic Stack 实战教程/04-fleet.md","lastUpdated":1726761436000}'),m={name:"courses/elastic-stack/Elastic Stack 实战教程/04-fleet.md"};function b(i,s,C,A,v,x){const l=c,p=h("ClientOnly");return n(),r("div",null,[s[0]||(s[0]=e("h1",{id:"使用-fleet-管理-elastic-agent-监控应用",tabindex:"-1"},[k("使用 Fleet 管理 Elastic Agent 监控应用 "),e("a",{class:"header-anchor",href:"#使用-fleet-管理-elastic-agent-监控应用","aria-label":'Permalink to "使用 Fleet 管理 Elastic Agent 监控应用"'},"​")],-1)),o(p,null,{default:u(()=>{var t,a;return[(((t=i.$frontmatter)==null?void 0:t.aside)??!0)&&(((a=i.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(n(),y(l,{key:0,article:i.$frontmatter},null,8,["article"])):F("",!0)]}),_:1}),s[1]||(s[1]=d(`<p>本系列 Elastic Stack 实战教程总共涵盖 5 个实验，目的是帮助初学者快速掌握 Elastic Stack 的基本技能。</p><blockquote><p><a href="https://developer.aliyun.com/adc/scenarioSeries/24e7a7a4d56741d0bdcb3ee73c9c22f1" target="_blank" rel="noreferrer">云起实验室在线体验地址</a></p><ul><li>实验 1：Elastic Stack 8 快速上手</li><li>实验 2：ILM 索引生命周期管理</li><li>实验 3：快照备份与恢复</li><li>实验 4：使用 Fleet 管理 Elastic Agent 监控应用</li><li>实验 5：Elasticsearch Java API Client 开发</li></ul></blockquote><h3 id="_1-fleet-介绍" tabindex="-1">1 Fleet 介绍 <a class="header-anchor" href="#_1-fleet-介绍" aria-label="Permalink to &quot;1 Fleet 介绍&quot;">​</a></h3><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810155848.png" alt=""></p><p>Elastic 从 7.13 版本开始，引入 Fleet。Fleet 是 Elastic Stack 的一个组件，用于集中管理 Elastic Agent。在此之前，我们通常采用 Beats 来对应用程序进行监控。</p><p><strong>Beats</strong> 是向 Elasticsearch 发送数据的轻量级数据传送器，Elastic 针对日志，指标，运行状态，网络流量等场景提供了不同类型的 Beats，例如 Filebeat，MetricBeat，HeartBeat，PacketBeat 等等。</p><p><strong>Elastic Agent</strong> 是一个集成所有 Beats 功能的统一代理，通过 gRPC 管理及调用各种 Beats，你不再需要为了部署各种 Beats 而感到头疼，并且 Elastic Agent 可以通过 <strong>Fleet</strong> 程序来集中管理。</p><p>Fleet 由两部分组成：</p><ul><li><strong>Fleet UI</strong> 是一个带有可视化界面的 Kibana 应用程序，用户可以在界面配置和管理 Elastic Agent 的策略，并且在 Fleet 页面上查看所有 Elastic Agent 的状态。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810153731.png" alt=""></p><ul><li><strong>Fleet Server</strong> 负责集中管理 Elastic Agent 的策略和生命周期，它提供了用于更新 Elastic Agent 的控制平面，并指示 Elastic Agent 执行一些操作，例如更新监控策略，跨主机运行 Osquery 或在网络层隔离主机以遏制安全威胁。Fleet Server 也是一个特殊的 Elastic Agent。</li></ul><p>我们可以创建 <strong>Agent Policy</strong> 并关联多个主机，来统一管理这些主机的策略，并在 Agent Policy 中添加各种 <strong>Integration</strong> 来集成各种功能，例如日志收集，指标监控等等。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810155042.png" alt=""></p><h3 id="_2-部署-elasticsearch" tabindex="-1">2 部署 Elasticsearch <a class="header-anchor" href="#_2-部署-elasticsearch" aria-label="Permalink to &quot;2 部署 Elasticsearch&quot;">​</a></h3><p>在本实验中，我们准备将 Fleet Server 和 Elasticsearch 以及 Kibana 安装在同一个主机上，然后在另一台主机上安装 Elastic Agent 监控应用服务。</p><p>出于安全原因，Elasticsearch 默认不允许使用 root 用户启动。执行以下命令，创建 elastic 用户，设置密码为 elastic123 ，并切换到该用户。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">useradd</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -s</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /bin/bash</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elastic</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">echo</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;elastic:elastic123&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> chpasswd</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">su</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> -</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elastic</span></span></code></pre></div><p>下载和解压 Elasticsearch 安装文件。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">wget</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.3.3-linux-x86_64.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">wget</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.3.3-linux-x86_64.tar.gz.sha512</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">shasum</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -a</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 512</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -c</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elasticsearch-8.3.3-linux-x86_64.tar.gz.sha512</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">tar</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -xzf</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elasticsearch-8.3.3-linux-x86_64.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elasticsearch-8.3.3/</span></span></code></pre></div><p>修改 config/elasticsearch.yml 配置文件，添加以下内容，启用内置 API 密钥服务。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">xpack.security.authc.api_key.enabled:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> true</span></span></code></pre></div><p>执行如下命令，启动 Elasticsearch。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">./bin/elasticsearch</span></span></code></pre></div><p>启动成功后，会输出以下内容，保存好以下两个内容：</p><ul><li>elastic 用户密码。</li><li>Kibana 注册 token。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809110451.png" alt=""></p><h3 id="_3-部署-kibana" tabindex="-1">3 部署 Kibana <a class="header-anchor" href="#_3-部署-kibana" aria-label="Permalink to &quot;3 部署 Kibana&quot;">​</a></h3><p>打开一个新的终端， 切换到 elastic 用户。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">su</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> -</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elastic</span></span></code></pre></div><p>执行如下命令，下载和解压 Kibana 安装文件。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -O</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://artifacts.elastic.co/downloads/kibana/kibana-8.3.3-linux-x86_64.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://artifacts.elastic.co/downloads/kibana/kibana-8.3.3-linux-x86_64.tar.gz.sha512</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> shasum</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -a</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 512</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -c</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> -</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">tar</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -xzf</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kibana-8.3.3-linux-x86_64.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kibana-8.3.3/</span></span></code></pre></div><p>执行以下命令，生成  saved objects encryption key。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">bin/kibana-encryption-keys</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> generate</span></span></code></pre></div><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111247.png" alt=""></p><p>编辑 config/kibana.yml 配置文件，修改以下内容，允许 Kibana 服务监听本机所有 IP 地址。同时将生成 <code>xpack.encryptedSavedObjects.encryptionKey</code> 的添加到文件中。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">server.host:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;0.0.0.0&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">xpack.encryptedSavedObjects.encryptionKey:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> c0ebc52748dd217a30af01f05d097e3f</span><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"> # 上面生成的结果</span></span></code></pre></div><p>执行如下命令，启动 Kibana。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">./bin/kibana</span></span></code></pre></div><p>启动成功后，会输出以下内容。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111722.png" alt=""></p><p>浏览器输入 <code>http://&lt;ESC 公网 IP&gt;:5601/?code=978607</code> 访问 Kibana 界面，注意本场景中提供了两台 ECS 实例，请填写正确的 ECS 公网 IP 地址。<strong>code=978607</strong> 修改为上面终端输出的内容。在 <strong>Enrollment token</strong> 输入框中填入第 1 小节启动 Elasticsearch 后输出的 Kibana 注册 token，然后点击 <strong>Configure Elastic</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111920.png" alt=""></p><p>接着 Kibana 会自动完成注册设置。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809101955.png" alt=""></p><p>Kibana 注册成功后会出现登录界面，输入 <strong>elastic</strong> 用户名密码登录 Elasticsearch。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220619173610.png" alt=""></p><h3 id="_4-部署-fleet" tabindex="-1">4 部署 Fleet <a class="header-anchor" href="#_4-部署-fleet" aria-label="Permalink to &quot;4 部署 Fleet&quot;">​</a></h3><p>点击 <strong>Management -&gt; Fleet -&gt; Settings -&gt; Fleet server hosts -&gt; Edit hosts</strong> 添加 Fleet Server 信息。<a href="https://10.20.61.185:8220/" target="_blank" rel="noreferrer">https://10.20.61.185:8220</a> 是你准备安装 Fleet Server 的服务器地址，请根据实际情况进行修改，可以在云产品资源信息中查看 ECS 的 IP 地址（使用私有地址），Fleet Server 默认启动的端口号是 8220。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809112623.png" alt=""></p><p>然后点击左上角的 <strong>Agents</strong> 标签。为了方便实验，选择 <strong>Quick Start</strong> 模式。点击 <strong>Generate Fleet Server Policy</strong> 让 Fleet 为我们自动生成 Fleet Server 策略和注册令牌。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809112952.png" alt=""></p><p>在本实验中，我们将 Fleet Server 和 Elasticsearch 以及 Kibana 安装在同一个主机上，在生产环境中建议将 Fleet Server 安装在单独的主机上。复制以下命令，打开一个新的终端并执行命令。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113138.png" alt=""></p><p>当提示是否安装时，输入 <strong>y</strong> 确认。当出现以下内容时，表示 Fleet Server 已经安装成功。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113652.png" alt=""></p><p>可以使用 <code>elastic-agent status</code> 命令查看各个组件的运行状态。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113905.png" alt=""></p><p>此时重新回到 Kibana 界面可以看到 Fleet Server 已经成功连接。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113930.png" alt=""></p><h3 id="_5-创建-agent-policy" tabindex="-1">5 创建 Agent Policy <a class="header-anchor" href="#_5-创建-agent-policy" aria-label="Permalink to &quot;5 创建 Agent Policy&quot;">​</a></h3><p>点击 <strong>Management -&gt; Fleet -&gt; Agents policies -&gt; Create agent policy</strong> 创建一条策略用于关联 Elastic Agent 。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115005.png" alt=""> 输入策略名 My Agent Policy，点击 <strong>Create agent policy</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115119.png" alt=""></p><p>创建好的策略如下所示。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115253.png" alt=""></p><h3 id="_6-部署-elastic-agent" tabindex="-1">6 部署 Elastic Agent <a class="header-anchor" href="#_6-部署-elastic-agent" aria-label="Permalink to &quot;6 部署 Elastic Agent&quot;">​</a></h3><p>在 Kibana 界面点击 <strong>Management -&gt; Fleet -&gt; Agents -&gt; Add agent</strong> 添加 Elastic Agent。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809114140.png" alt=""></p><p>Elastic Agent 选择关联第 4 小节中创建的 agent policy，选择在 Fleet 中注册 Elastic Agent 实现集中管理 Elastic Agent 的效果，可以帮助我们自动更新配置到 Elastic Agent 上。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115559.png" alt=""></p><p>然后我们在另一个主机上安装 Elastic Agent，打开一个新的终端，执行 <code>ssh root@&lt;ESC 公网 IP&gt;</code> 命令登录到第二台 ECS 上。</p><p>复制 Elastic Agent 的安装命令到新的主机上执行，由于 Fleet Server 用于 TLS 加密的自签名的证书，因此最后一条命令做了一点修改，在末尾添加了 <code>--insecure</code> 参数，表示允许连接到不受信任的服务器。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -L</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -O</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-8.3.3-linux-x86_64.tar.gz</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">tar</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> xzvf</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elastic-agent-8.3.3-linux-x86_64.tar.gz</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> </span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> elastic-agent-8.3.3-linux-x86_64</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">sudo</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ./elastic-agent</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --url=https://10.20.61.185:8220</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --enrollment-token=cGRPNmdJSUJaWFgwY01acW5rYkk6cEF4djYxbjFSM0NNOHl6czg2bS1tUQ==</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --insecure</span></span></code></pre></div><p>当提示是否安装时，输入 <strong>y</strong> 确认。当出现以下内容时，表示 Elastic Agent 已经安装成功。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120755.png" alt=""></p><p>可以使用 <code>elastic-agent status</code> 命令查看各个组件的运行状态。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120846.png" alt=""></p><p>此时重新回到 Kibana 界面可以看到 Elastic Agent 已经成功连接。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120856.png" alt=""></p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120940.png" alt=""></p><h3 id="_7-指标监控" tabindex="-1">7 指标监控 <a class="header-anchor" href="#_7-指标监控" aria-label="Permalink to &quot;7 指标监控&quot;">​</a></h3><p>指标监控可以帮助我们监测 CPU，内存，磁盘，网络，进程等资源的使用情况，在第 4 小节创建 agent policy 时会自动创建一个System Integrations 用于监控系统指标，Syslog，用户，SSH 登录等信息。</p><p>点击 <strong>Analytics -&gt; Dashboard</strong> 界面，搜索 metric 可以看到 Fleet 为我们自动创建的一些内置的指标监控面板。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810100009.png" alt=""></p><p>点击 <strong>[Metrics System] Host overview</strong> 面板，可以查看主机相关的指标监控信息。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095049.png" alt=""></p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095112.png" alt=""></p><p>点击 <strong>[Elastic Agent] Agent metrics</strong> 面板可以看到 Elastic Agent 相关的指标监控信息。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095741.png" alt=""></p><h3 id="_8-http-tcp-icmp-监控" tabindex="-1">8 HTTP, TCP, ICMP 监控 <a class="header-anchor" href="#_8-http-tcp-icmp-监控" aria-label="Permalink to &quot;8 HTTP, TCP, ICMP  监控&quot;">​</a></h3><p>Fleet 提供了以下几种轻量级检查来监控网络端点的状态：</p><ul><li>1.<strong>HTTP</strong>：向服务发送 HTTP 请求，可以根据 HTTP 响应码和响应体来判断服务是否运行正常。</li><li>2.<strong>TCP</strong>：确保服务的端口正在监听。</li><li>3.<strong>ICMP</strong>：通过 ICMP 请求来检测主机的网络可达性。</li></ul><p>接下来先创建一个 HTTP 监控，点击 <strong>Management -&gt; Fleet -&gt; Agent policies -&gt; My Agent Policy -&gt; Add integration</strong>，添加监控策略。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143007.png" alt=""></p><p>在搜索栏中，输入 <strong>Elastic Synthetics</strong>，点击 <strong>Elastic Synthetics</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143124.png" alt=""></p><p>点击 <strong>Add Elastic Synthetics</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143140.png" alt=""></p><ul><li><strong>Integration name</strong> 输入 <code>http-1</code>。</li><li><strong>Monitor Type</strong> 选择 <code>HTTP</code>。</li><li><strong>URL</strong> 设置 <code>http://localhost:8080</code>，后续我们会在该端口启动一个 Web 服务。</li><li><strong>Frequency</strong> 检测频率设置为 5s。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143713.png" alt=""></p><ul><li><strong>Timeout in seconds</strong> 检测失败的超时时间设置为 3s。</li><li><strong>Agent policy</strong> 关联 <code>My Agent Policy</code>。</li><li>点击 <strong>Save and continue</strong> 保存配置。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143727.png" alt=""></p><p>然后我们创建一个 TCP 监控。</p><ul><li><strong>Integration name</strong> 输入 <code>tcp-1</code>。</li><li><strong>Monitor Type</strong> 选择 <code>TCP</code>。</li><li><strong>Host:Port</strong>：设置 <code>localhost:8090</code>，后续我们会在该端口启动一个 Web 服务。</li><li><strong>Frequency</strong> 检测频率设置为 5s。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143901.png" alt=""></p><ul><li><strong>Timeout in seconds</strong> 检测失败的超时时间设置为 3s。</li><li><strong>Agent policy</strong> 关联 <code>My Agent Policy</code>。</li><li>点击 <strong>Save and continue</strong> 保存配置。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143912.png" alt=""></p><p>最后创建一个 ICMP 监控。</p><ul><li><strong>Integration name</strong> 输入 <code>icmp-1</code>。</li><li><strong>Monitor Type</strong> 选择 <code>ICMP</code>。</li><li><strong>Host</strong>：设置 <code>localhost</code>。</li><li><strong>Frequency</strong> 检测频率设置为 5s。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143957.png" alt=""></p><ul><li><strong>Timeout in seconds</strong> 检测失败的超时时间设置为 3s。</li><li><strong>Agent policy</strong> 关联 <code>My Agent Policy</code>。</li><li>点击 <strong>Save and continue</strong> 保存配置。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144010.png" alt=""></p><p>最终我们创建完的 HTTP, TCP, ICMP 监控如下所示。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144042.png" alt=""> 点击 <strong>Observability -&gt; Uptime -&gt; Monitors</strong> 界面查看刚刚创建的监控状态，可以看到 icmp-1 的状态是 Up，此时主机是网络可达的；由于目前 8080 和 8090 端口还没服务在监听，因此 http-1 和 tcp-1 的状态现在是 Down。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144154.png" alt=""></p><p>接下来我们准备在 8080 和 8090 两个端口上运行服务。为了方便部署，这里准备使用 Docker 来启动 Nginx 服务。在登录第二台 ECS 服务器的终端执行以下命令，安装 Docker。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -sSL</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> https://get.daocloud.io/docker</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> sh</span></span></code></pre></div><p>启动两个 Nginx 容器，将 Nginx 的 80 端口分别映射到宿主机的 8080 和 8090 端口号上。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -d</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> mynginx1</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -p</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 8080</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:80</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -d</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> mynginx2</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -p</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 8090</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:80</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx</span></span></code></pre></div><p>使用 <code>docker ps </code> 命令查看容器状态。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144537.png" alt=""></p><p>再次查看 Uptime Monitors 面板，可以看到 http-1 和 tcp-1 的状态已经变为 Up。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144557.png" alt=""></p><h3 id="_9-日志监控" tabindex="-1">9 日志监控 <a class="header-anchor" href="#_9-日志监控" aria-label="Permalink to &quot;9 日志监控&quot;">​</a></h3><p>Fleet 对许多软件的日志，例如 Nginx, Redis, MySQL 提供了开箱即用的支持。Fleet 会对收集的日志进行处理，并且提供内置的面板进行可视化的展示分析。在本小节中，将对 Nginx 的日志进行采集分析。</p><p>点击 <strong>Management -&gt; Fleet -&gt; Agent policies -&gt; My Agent Policy -&gt; Add integration</strong>，添加监控策略。在搜索栏中，输入 Nginx，点击 Nginx。 <img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144847.png" alt=""></p><p>点击 <strong>Add Nginx</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144903.png" alt=""></p><p>默认的 Nginx 监控配置如下所示。主要分为两部分：</p><ul><li>1.Nginx 日志采集。</li><li>2.Nginx 指标监控，通过 HTTP 接口实时监测 Nginx 的连接状态。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145015.png" alt=""></p><p><strong>Integration name</strong> 输入 nginx-1。日志采集的路径根据实际情况进行修改，这里我们保持不变。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145029.png" alt=""></p><p>指标监控也保持不变，后续会在 Nginx 的 80 端口上配置 /nginx_status 路径用于暴露 Nginx 指标监控。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810104750.png" alt=""></p><ul><li><strong>Agent policy</strong> 关联 <code>My Agent Policy</code>。</li><li>点击 <strong>Save and continue</strong> 保存配置。</li></ul><p>最终创建完成的 Nginx 监控如下所示。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145055.png" alt=""></p><p>接下来准备在主机上部署 Nginx 服务。在登录第二台 ECS 服务器的终端执行以下命令，安装 Nginx。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">apt</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> install</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -y</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx</span></span></code></pre></div><p>编辑 Nginx 配置文件 /etc/nginx/sites-enabled/default，在默认的 80 端口的 server 配置块中添加以下配置，开启 Nginx 状态监控。</p><div class="language-nginx vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">nginx</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">location</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> /nginx_status </span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">{</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    stub_status</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220818114817.png" alt=""></p><p>保存配置退出后，执行 <code>systemctl restart nginx</code> 命令重启 Nginx 服务。然后执行 <code>systemctl status nginx</code> 命令查看 Nginx 状态。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145250.png" alt=""></p><p>在本机访问 Nginx 默认监听的 80 端口。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> http://localhost</span></span></code></pre></div><p>响应结果如下所示，返回了 Nginx 默认的欢迎页面。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145340.png" alt=""></p><p>访问一个不存在的 URL 路径，制造 404 的错误。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> http://localhost/mypath</span></span></code></pre></div><p>响应结果如下所示。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145508.png" alt=""></p><p>执行以下命令，查看 Nginx 日志。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">tail</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -f</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /var/log/nginx/access.log</span></span></code></pre></div><p>可以看到有 3 条日志，分别是第一次 200 成功访问 Nginx 的请求以及第二次 404 错误的请求。最后一条请求是 Elastic Agent 采集 Nginx 指标所产生的日志。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150225.png" alt=""></p><p>点击 <strong>Management -&gt; Fleet -&gt; Data Streams</strong> 界面，搜索 nginx，查看 Nginx 相关的监控项。点击每行右侧的 Actions 按钮可以跳转到相应的监控面板。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150311.png" alt=""></p><p>点击 <strong>[Logs Nginx ] Access and error logs</strong> 面板可以查看 Nginx 访问日志和错误日志。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150532.png" alt=""></p><p>点击 <strong>[Logs Nginx ] Overview</strong> 面板可以查看 Nginx 的日志分析。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150557.png" alt=""></p><p>点击 <strong>[Metrics Nginx]Overview</strong> 面板可以查看 Nginx 的指标监控信息。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150617.png" alt=""></p><p>点击 <strong>Observability -&gt; Logs -&gt; Stream</strong> 界面，点击 <strong>Stream live</strong> 可以实时查看日志，就像我们在主机上执行 <code>tail -f</code> 命令一样。在搜索栏可以输入过滤条件对日志进行过滤，例如输入<code>&quot;data_stream.dataset&quot;:&quot;nginx.access&quot; and host.name:&quot;node-2&quot; </code> 可以过滤出主机名是 node-2 上的 Nginx 访问日志。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810104242.png" alt=""></p><h3 id="_10-使用-osquery-查询主机信息" tabindex="-1">10 使用 Osquery 查询主机信息 <a class="header-anchor" href="#_10-使用-osquery-查询主机信息" aria-label="Permalink to &quot;10 使用 Osquery 查询主机信息&quot;">​</a></h3><p>Osquery 是适用于 Windows、OS X (macOS) 和 Linux 操作系统的检测框架，使我们可以像查询数据库一样查询操作系统，例如操作系统版本，进程信息，网络信息，Docker 容器信息等等。</p><p>点击 <strong>Management -&gt; Fleet -&gt; Agent policies -&gt; My Agent Policy -&gt; Add integration</strong>，添加监控策略。在搜索栏中搜索 <strong>Osquery</strong>，点击 <strong>Osquery Manager</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150703.png" alt=""></p><p>点击 <strong>Add Osquery Manager</strong>。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150717.png" alt=""></p><ul><li><strong>integration name</strong> 填写 <code>osquery_manager-1</code></li><li><strong>Agent policy</strong> 关联 <code>My Agent Policy</code>。</li><li>点击 <strong>Save and continue</strong> 保存配置。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150734.png" alt=""></p><p>最终创建完成的 Osquery 策略如下所示。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150809.png" alt=""></p><p>点击 <strong>Management -&gt; Osquery -&gt; New live query</strong> 新建 Osquery 查询。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220819111633.png" alt=""></p><p>在 <strong>Agents</strong> 选项中可以选择需要执行 Osquery 的主机，这里选择 <code>My Agent Policy</code> 关联的主机。 在 <strong>Query</strong> 输入框下方可以输入执行的 SQL 语句，详情可以参见 <a href="https://osquery.io/schema/5.0.1" target="_blank" rel="noreferrer">Osquery schema</a>。</p><p>接下来列举几个常用的 Osquery 示例：</p><ul><li>查询操作系统版本。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151008.png" alt=""></p><ul><li>查询进程。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151538.png" alt=""></p><p>查询结果也支持使用 WHERE 关键字进行过滤，例如过滤出 disk_bytes_read 大于 100000 的结果。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151637.png" alt=""></p><ul><li>查询接口 IP 地址。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151109.png" alt=""></p><ul><li>查询容器信息。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151326.png" alt=""></p><ul><li>查询路由信息。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151410.png" alt=""></p><p>查询的历史结果可以在 <strong>Management -&gt; Osquery -&gt; Live queries</strong> 中找到。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810113729.png" alt=""></p>`,195))])}const j=g(m,[["render",b]]);export{E as __pageData,j as default};
