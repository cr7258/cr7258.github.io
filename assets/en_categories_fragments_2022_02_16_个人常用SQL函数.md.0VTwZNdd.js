import{_ as r}from"./chunks/ArticleMetadata.Sb1DYAHo.js";import{_ as o,D as e,o as t,c,k as h,a as l,I as n,w as g,R as y,b as A,e as C}from"./chunks/framework.FVQzxbLi.js";import"./chunks/md5.RtphNWHi.js";const f=JSON.parse('{"title":"个人常用 SQL 函数","description":"","frontmatter":{"title":"个人常用 SQL 函数","author":"查尔斯","date":"2022/02/16 15:43","isTop":true,"categories":["杂碎逆袭史"],"tags":["SQL","SQL函数"]},"headers":[],"relativePath":"en/categories/fragments/2022/02/16/个人常用SQL函数.md","filePath":"en/categories/fragments/2022/02/16/个人常用SQL函数.md","lastUpdated":1704466962000}'),m={name:"en/categories/fragments/2022/02/16/个人常用SQL函数.md"},F={id:"个人常用-sql-函数",tabindex:"-1"},D=h("a",{class:"header-anchor",href:"#个人常用-sql-函数","aria-label":'Permalink to "个人常用 SQL 函数 <Badge text="持续更新" type="warning" />"'},"​",-1),u=y(`<h2 id="时间函数" tabindex="-1">时间函数 <a class="header-anchor" href="#时间函数" aria-label="Permalink to &quot;时间函数&quot;">​</a></h2><h3 id="获取当前时间-mysql" tabindex="-1">获取当前时间（MySQL） <a class="header-anchor" href="#获取当前时间-mysql" aria-label="Permalink to &quot;获取当前时间（MySQL）&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"># 输出格式为：yyyy</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">MM</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">dd HH:mm:ss</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">NOW</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">();</span></span></code></pre></div><h3 id="获取当前时间秒-mysql" tabindex="-1">获取当前时间秒（MySQL） <a class="header-anchor" href="#获取当前时间秒-mysql" aria-label="Permalink to &quot;获取当前时间秒（MySQL）&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"># 从 1970年1月1日 开始到现在的秒数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">UNIX_TIMESTAMP();</span></span></code></pre></div><h3 id="计算两个时间之间的间隔-mysql" tabindex="-1">计算两个时间之间的间隔（MySQL） <a class="header-anchor" href="#计算两个时间之间的间隔-mysql" aria-label="Permalink to &quot;计算两个时间之间的间隔（MySQL）&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"># unit 可选为FRAC_SECOND 毫秒、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">SECOND</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 秒、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">MINUTE</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 分钟、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">HOUR</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 小时、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">DAY</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 天、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">WEEK</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 星期、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">MONTH</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 月、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">QUARTER</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 季度、</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">YEAR</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 年</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">TIMESTAMPDIFF(unit, datetime_expr1, datetime_expr2)</span></span></code></pre></div><h2 id="字符串函数" tabindex="-1">字符串函数 <a class="header-anchor" href="#字符串函数" aria-label="Permalink to &quot;字符串函数&quot;">​</a></h2><h3 id="拼接字符串-mysql" tabindex="-1">拼接字符串（MySQL） <a class="header-anchor" href="#拼接字符串-mysql" aria-label="Permalink to &quot;拼接字符串（MySQL）&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"># 将多个字符串拼接在一起</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">CONCAT</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(str1, str2, ...)</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">笔者说</p><p>这个函数看起来平平无奇，但实际用起来，可不只是真香。你可能会在 MyBatis 中解决 SQL 注入的时候用到它，还可能在一些 “奇怪” 的场景用到它。</p></div><h4 id="清空数据库中的所有表数据" tabindex="-1">清空数据库中的所有表数据 <a class="header-anchor" href="#清空数据库中的所有表数据" aria-label="Permalink to &quot;清空数据库中的所有表数据&quot;">​</a></h4><p>清空单表数据很简单。</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">TRUNCATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> TABLE</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 表名;</span></span></code></pre></div><p>但是，如果现在有 100 + 张表？你当然不会一个一个的去 <code>TRUNCATE</code>，但 MySQL 又没有提供该功能。那你可以用用下面的方法。</p><ol><li><p>查询该数据库下的所有表，利用 <code>CONCAT()</code> 函数将 <code>TRUNCATE</code> 语句拼接起来</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">SELECT</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  CONCAT(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">&#39;TRUNCATE TABLE &#39;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> TABLE_NAME,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  information_schema.TABLES</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">WHERE</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> TABLE_SCHEMA</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;数据库名&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span></code></pre></div></li><li><p>将执行结果复制，直接执行即可</p></li></ol><h4 id="删除数据库中的所有表" tabindex="-1">删除数据库中的所有表 <a class="header-anchor" href="#删除数据库中的所有表" aria-label="Permalink to &quot;删除数据库中的所有表&quot;">​</a></h4><p>删除单表很简单。</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">DROP</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> TABLE</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> 表名;</span></span></code></pre></div><p>但是，如果现在有 100 + 张表？你当然不会一个一个的去 <code>DROP</code>，但 MySQL 又没有提供该功能。那你可以用用下面的方法。</p><ol><li><p>查询该数据库下的所有表，利用 <code>CONCAT()</code> 函数将 <code>DROP</code> 语句拼接起来</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">SELECT</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  CONCAT(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">&#39;DROP TABLE IF EXISTS &#39;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> TABLE_NAME,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> </span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">  information_schema.TABLES</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">WHERE</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> TABLE_SCHEMA</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;数据库名&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span></code></pre></div></li><li><p>将执行结果复制，直接执行即可</p></li></ol>`,21);function E(s,_,b,v,B,T){const p=e("Badge"),k=r,d=e("ClientOnly");return t(),c("div",null,[h("h1",F,[l("个人常用 SQL 函数 "),n(p,{text:"持续更新",type:"warning"}),l(),D]),n(d,null,{default:g(()=>{var i,a;return[(((i=s.$frontmatter)==null?void 0:i.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(t(),A(k,{key:0,article:s.$frontmatter},null,8,["article"])):C("",!0)]}),_:1}),u])}const M=o(m,[["render",E]]);export{f as __pageData,M as default};
