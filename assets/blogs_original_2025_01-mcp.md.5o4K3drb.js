import{_ as s,o as i,c as a,R as n}from"./chunks/framework.FHZ5yb6k.js";const C=JSON.parse('{"title":"一文带你入门 MCP（模型上下文协议）","description":"","frontmatter":{"title":"一文带你入门 MCP（模型上下文协议）","author":"Se7en","date":"2025/01/07 13:30","categories":["AI"],"tags":["MCP","AI"]},"headers":[],"relativePath":"blogs/original/2025/01-mcp.md","filePath":"blogs/original/2025/01-mcp.md","lastUpdated":1736243876000}'),e={name:"blogs/original/2025/01-mcp.md"},t=n(`<h2 id="什么是-mcp" tabindex="-1">什么是 MCP？ <a class="header-anchor" href="#什么是-mcp" aria-label="Permalink to &quot;什么是 MCP？&quot;">​</a></h2><p>MCP（Model Context Protocol，模型上下文协议） 是由 Anthropic 推出的一种开放标准，旨在统一大型语言模型（LLM）与外部数据源和工具之间的通信协议。MCP 的主要目的在于解决当前 AI 模型因数据孤岛限制而无法充分发挥潜力的难题，MCP 使得 AI 应用能够安全地访问和操作本地及远程数据，为 AI 应用提供了连接万物的接口。</p><h2 id="mcp-架构" tabindex="-1">MCP 架构 <a class="header-anchor" href="#mcp-架构" aria-label="Permalink to &quot;MCP 架构&quot;">​</a></h2><p>MCP 遵循客户端-服务器架构（client-server），其中包含以下几个核心概念：</p><ul><li><strong>MCP 主机（MCP Hosts）</strong>：发起请求的 LLM 应用程序（例如 Claude Desktop、IDE 或 AI 工具）。</li><li><strong>MCP 客户端（MCP Clients）</strong>：在主机程序内部，与 MCP server 保持 1:1 的连接。</li><li><strong>MCP 服务器（MCP Servers）</strong>：为 MCP client 提供上下文、工具和 prompt 信息。</li><li><strong>本地资源（Local Resources）</strong>：本地计算机中可供 MCP server 安全访问的资源（例如文件、数据库）。</li><li><strong>远程资源（Remote Resources）</strong>：MCP server 可以连接到的远程资源（例如通过 API）。</li></ul><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071502607.png" alt=""></p><h2 id="mcp-client" tabindex="-1">MCP Client <a class="header-anchor" href="#mcp-client" aria-label="Permalink to &quot;MCP Client&quot;">​</a></h2><p>MCP client 充当 LLM 和 MCP server 之间的桥梁，MCP client 的工作流程如下：</p><ul><li>MCP client 首先从 MCP server 获取可用的工具列表。</li><li>将用户的查询连同工具描述通过 <a href="https://platform.openai.com/docs/guides/function-calling" target="_blank" rel="noreferrer">function calling</a> 一起发送给 LLM。</li><li>LLM 决定是否需要使用工具以及使用哪些工具。</li><li>如果需要使用工具，MCP client 会通过 MCP server 执行相应的工具调用。</li><li>工具调用的结果会被发送回 LLM。</li><li>LLM 基于所有信息生成自然语言响应。</li><li>最后将响应展示给用户。</li></ul><p>你可以在 <a href="https://modelcontextprotocol.io/clients" target="_blank" rel="noreferrer">Example Clients</a> 找到当前支持 MCP 协议的客户端程序。本文将会使用 Claude Desktop 作为 MCP client，你可以在此页面下载安装：<a href="https://claude.ai/download" target="_blank" rel="noreferrer">https://claude.ai/download</a> 。</p><h2 id="mcp-server" tabindex="-1">MCP Server <a class="header-anchor" href="#mcp-server" aria-label="Permalink to &quot;MCP Server&quot;">​</a></h2><p>MCP server 是 MCP 架构中的关键组件，它可以提供 3 种主要类型的功能：</p><ol><li>资源（Resources）：类似文件的数据，可以被客户端读取，如 API 响应或文件内容。</li><li>工具（Tools）：可以被 LLM 调用的函数（需要用户批准）。</li><li>提示（Prompts）：预先编写的模板，帮助用户完成特定任务。</li></ol><p>这些功能使 MCP server 能够为 AI 应用提供丰富的上下文信息和操作能力，从而增强 LLM 的实用性和灵活性。</p><p>你可以在 <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noreferrer">MCP Servers Repository</a> 和 <a href="https://github.com/punkpeye/awesome-mcp-servers" target="_blank" rel="noreferrer">Awesome MCP Servers</a> 这两个 repo 中找到许多由社区实现的 MCP server。使用 TypeScript 编写的 MCP server 可以通过 <a href="https://docs.npmjs.com/cli/v8/commands/npx" target="_blank" rel="noreferrer">npx</a> 命令来运行，使用 Python 编写的 MCP server 可以通过 <a href="https://docs.astral.sh/uv/concepts/tools/" target="_blank" rel="noreferrer">uvx</a> 命令来运行。</p><h2 id="使用-claude-desktop-通过-postgresql-mcp-server-查询数据库信息" tabindex="-1">使用 Claude Desktop 通过 PostgreSQL MCP Server 查询数据库信息 <a class="header-anchor" href="#使用-claude-desktop-通过-postgresql-mcp-server-查询数据库信息" aria-label="Permalink to &quot;使用 Claude Desktop 通过 PostgreSQL MCP Server 查询数据库信息&quot;">​</a></h2><p>接下来演示通过 <a href="https://github.com/modelcontextprotocol/servers/tree/main/src/postgres" target="_blank" rel="noreferrer">PostgreSQL MCP Server</a> 使 LLM 能够基于 PostgreSQL 中的数据来回答问题。</p><h3 id="准备-postgresql-数据" tabindex="-1">准备 PostgreSQL 数据 <a class="header-anchor" href="#准备-postgresql-数据" aria-label="Permalink to &quot;准备 PostgreSQL 数据&quot;">​</a></h3><p>首先使用 Docker 启动 PostgreSQL 服务。</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -d</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --name</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> postgres</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -e</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> POSTGRES_PASSWORD=postgres</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -p</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 5432</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:5432</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  postgres</span></span></code></pre></div><p>在 PostgreSQL 中创建数据库和表，并插入数据。</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 登录 PostgreSQL</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">docker </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">exec</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> -</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">it postgres psql </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">U postgres</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 创建数据库</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> DATABASE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> shopdb</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 连接到新创建的数据库</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">\\c shopdb;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 创建 users 表</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> TABLE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> users</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    user_id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">SERIAL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> PRIMARY KEY</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    first_name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    last_name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    email </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">UNIQUE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> NOT NULL</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 创建 orders 表</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> TABLE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> orders</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    order_id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">SERIAL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> PRIMARY KEY</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    order_date </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">TIMESTAMP</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    total_amount </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">DECIMAL</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    user_id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">INT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> REFERENCES</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> users(user_id)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">-- 插入示例数据</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">INSERT INTO</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> users (first_name, last_name, email) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">VALUES</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;John&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;Doe&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;john.doe@example.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;Jane&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;Smith&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;jane.smith@example.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;Alice&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;Johnson&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;alice.johnson@example.com&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">INSERT INTO</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> orders (order_date, total_amount, user_id) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">VALUES</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;2025-01-05 10:30:00&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">150</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">75</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;2025-01-06 11:00:00&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&#39;2025-01-07 12:45:00&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">120</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">25</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span></code></pre></div><h3 id="配置连接-postgresql-mcp-server" tabindex="-1">配置连接 PostgreSQL MCP Server <a class="header-anchor" href="#配置连接-postgresql-mcp-server" aria-label="Permalink to &quot;配置连接 PostgreSQL MCP Server&quot;">​</a></h3><p>在 Claude Desktop 中配置 PostgreSQL MCP Server 的连接信息，具体内容可以参考：<a href="https://modelcontextprotocol.io/quickstart/user" target="_blank" rel="noreferrer">For Claude Desktop Users</a>。最终是在 <code>claude_desktop_config.json</code> 文件中添加如下内容：</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#8DDB8C;">  &quot;mcpServers&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#8DDB8C;">    &quot;postgres&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#8DDB8C;">      &quot;command&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;npx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#8DDB8C;">      &quot;args&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;-y&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;@modelcontextprotocol/server-postgres&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">        &quot;postgresql://postgres:postgres@127.0.0.1/shopdb&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">      ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>配置完毕后，重启 Claude Desktop。一切正常的话，你应该能在输入框的右下角看到一个锤子图标。点击锤子图标，可以看到 PostgreSQL MCP Server 提供的工具信息。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071632927.png" alt=""></p><h3 id="根据-postgresql-的数据进行提问" tabindex="-1">根据 PostgreSQL 的数据进行提问 <a class="header-anchor" href="#根据-postgresql-的数据进行提问" aria-label="Permalink to &quot;根据 PostgreSQL 的数据进行提问&quot;">​</a></h3><p>首先来问一个简短的问题：<strong>数据库中有哪些表？</strong> Claude 会判断出需要调用 MCP server 来查询 PostgreSQL 中的数据。这里会弹出一个窗口，需要用户授权。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071636327.png" alt=""></p><p>点击 Allow 后，Claude 成功返回了结果。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071706654.png" alt=""></p><p>接下来我们可以增加一点难度：查询<strong>金额最高的订单信息</strong>。在数据库中有两张表 <code>users</code> 和 <code>orders</code>，要想得到完整的订单信息，需要先去查询 <code>orders</code> 表中金额最高的一条记录，然后根据 <code>user_id</code> 这个外键再去查询 <code>users</code> 表中对应的用户信息。</p><p>从下面的数据可以发现 Claude 一开始是不知道数据库中的表结构的，因此先发送请求分别确定 <code>orders</code> 表和 <code>users</code> 表中相应的字段，然后再对两张表进行 join 查询。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071635588.png" alt=""></p><p>点击 <code>View Result from query from postgres</code> 可以看到 Claude Desktop 向 MCP server 发送的请求以及得到的响应，说明这个结果确实是从 PostgreSQL 数据库中查询得到的。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071637075.png" alt=""></p><p>你也可以复制这条 SQL 语句到数据库中查询进行确认。</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/202501071638683.png" alt=""></p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>本文带领读者快速入门了 MCP（模型上下文协议），介绍了其架构、核心概念以及实际应用场景。通过演示 Claude Desktop 结合 PostgreSQL MCP Server 查询数据库的场景，展示了 MCP 如何增强 LLM 与外部数据源的交互能力。后续文章还会继续分享 MCP server 和 MCP client 开发的相关内容，欢迎持续关注。</p><h2 id="参考资料" tabindex="-1">参考资料 <a class="header-anchor" href="#参考资料" aria-label="Permalink to &quot;参考资料&quot;">​</a></h2><ul><li>Model Context Protocol 官方文档：<a href="https://modelcontextprotocol.io/introduction" target="_blank" rel="noreferrer">https://modelcontextprotocol.io/introduction</a></li><li>深度解析：Anthropic MCP 协议：<a href="https://mp.weixin.qq.com/s/ASmcjW53HKokdYt1m-xyXA" target="_blank" rel="noreferrer">https://mp.weixin.qq.com/s/ASmcjW53HKokdYt1m-xyXA</a></li></ul>`,43),l=[t];function p(h,r,k,o,d,g){return i(),a("div",null,l)}const A=s(e,[["render",p]]);export{C as __pageData,A as default};