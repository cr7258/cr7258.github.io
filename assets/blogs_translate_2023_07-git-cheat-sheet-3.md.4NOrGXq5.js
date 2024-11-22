import{_ as n}from"./chunks/ArticleMetadata.Yw6SSleQ.js";import{_ as p,D as k,o as t,c as d,I as r,w as g,k as e,a as F,R as o,b as c,e as y}from"./chunks/framework.FHZ5yb6k.js";import"./chunks/md5.0oexlRJv.js";const q=JSON.parse('{"title":"Git 速查表：专家必备的 14 个 Git 命令","description":"","frontmatter":{"title":"Git 速查表：专家必备的 14 个 Git 命令","author":"Se7en","date":"2023/09/01 22:00","categories":["翻译"],"tags":["Git"]},"headers":[],"relativePath":"blogs/translate/2023/07-git-cheat-sheet-3.md","filePath":"blogs/translate/2023/07-git-cheat-sheet-3.md","lastUpdated":1707227798000}'),C={name:"blogs/translate/2023/07-git-cheat-sheet-3.md"},m=e("h1",{id:"git-速查表-专家必备的-14-个-git-命令",tabindex:"-1"},[F("Git 速查表：专家必备的 14 个 Git 命令 "),e("a",{class:"header-anchor",href:"#git-速查表-专家必备的-14-个-git-命令","aria-label":'Permalink to "Git 速查表：专家必备的 14 个 Git 命令"'},"​")],-1),b=o(`<blockquote><p>本文译自：Git Cheat Sheet: 14 Essential Git Commands For Experts<br> 原文链接：<a href="https://initialcommit.com/blog/git-cheat-sheet-expert" target="_blank" rel="noreferrer">https://initialcommit.com/blog/git-cheat-sheet-expert</a><br> 本系列共有三篇文章，本文是第三篇：</p><ul><li>Git Cheat Sheet: 12 Essential Git Commands For Beginners</li><li>Git Cheat Sheet: 12 Essential Git Commands For Intermediate Users</li><li>Git Cheat Sheet: 14 Essential Git Commands For Experts（本文）</li></ul></blockquote><h2 id="介绍" tabindex="-1">介绍 <a class="header-anchor" href="#介绍" aria-label="Permalink to &quot;介绍&quot;">​</a></h2><p>在之前的文章中，我们讨论了一些适用于初学者和中级用户的 Git 命令。</p><p>在本文中，我们将讨论专家必备的 14 个 Git 命令。</p><h2 id="git-submodule" tabindex="-1">git submodule <a class="header-anchor" href="#git-submodule" aria-label="Permalink to &quot;git submodule&quot;">​</a></h2><p>使用 Git 子模块，用户可以在 Git 仓库的子目录中保留和维护另一个 Git 仓库。Git 子模块是指向外部仓库中特定提交的引用。默认情况下，运行 git submodule 命令会显示当前仓库中现有子模块的状态。</p><p>用户可以使用以下命令添加新的子模块仓库：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> submodule</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> add</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">remote-git-submodule-repo-ur</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">l</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><p>子模块就像一个普通的 Git 仓库，但它嵌套在现有的 Git 仓库中。每个子模块都有自己的 .git/ 隐藏目录，其中包含子模块的对象数据库和 Git 配置信息。您可以像普通仓库一样在子模块中操作文件，例如进行更改、添加到暂存区、提交更改以及将更改推送到远程分支。</p><p>但是，您需要在父仓库中提交任何对子模块的更新（无论提交的代码是本地更改还是从远程拉取的），以确保子模块引用的是最新的代码版本。这使得子模块可以被视为父项目的依赖项。还有其他一些子模块命令，您可以通过运行命令 git help submodule 了解它们。</p><h2 id="git-show" tabindex="-1">git show <a class="header-anchor" href="#git-show" aria-label="Permalink to &quot;git show&quot;">​</a></h2><p>git show 命令显示当前仓库中 Git 对象的元数据。如果不带任何参数运行此命令，则会显示有关 HEAD 提交的信息，包括提交作者、日期、消息、更改的文件和更改的行。</p><p>例如，要查看特定 commit ID 的日志消息和文本差异，用户可以运行：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> show</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">commit-i</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><p>除了指定 commit ID，您还可以使用 branch，tag，blob hash 或者 tree hash。在每种情况下，git show 将显示该对象的内容。</p><h2 id="git-clean" tabindex="-1">git clean <a class="header-anchor" href="#git-clean" aria-label="Permalink to &quot;git clean&quot;">​</a></h2><p>Git clean 命令会从工作树中删除未跟踪的文件。如果没有提供路径，则从当前目录递归地删除未跟踪的文件。默认情况下，未跟踪的目录会被忽略，但可以通过添加 -d 标志来包含未跟踪的目录。如果提供了路径，则 git clean 仅会影响与该路径匹配的文件。</p><p>由于该命令会永久删除文件，因此最好首先使用 --dry-run 选项运行该命令。使用此选项，用户可以查看命令将删除哪些文件。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> clean</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --dry-run</span></span></code></pre></div><p>在确认要删除的文件列表后，可以执行不带 --dry-run 选项的 git clean 命令。</p><h2 id="git-fsck" tabindex="-1">git fsck <a class="header-anchor" href="#git-fsck" aria-label="Permalink to &quot;git fsck&quot;">​</a></h2><p>Git fsck 命令会检查 Git 仓库中对象的连通性和有效性。使用此命令，用户可以确认仓库中文件的完整性并识别任何已损坏的对象。此命令还将通知用户仓库中是否存在任何悬空对象。这些对象可能占用了仓库中不必要的空间，可以通过运行 git gc 命令来删除它们。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> fsck</span></span></code></pre></div><p>下面是 git fsck 命令的一些示例输出：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Checking</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> object</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> directories:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (256/256), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Checking</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (3475/3475), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">f42ad266a192bd843cd65b2c1cd913e0c97b5d2</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 31</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">c80610b88c73e8862461db80fb4af3ace39a16</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> b448bc1853b62fe673e0212bb703b2ebe5c45705</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 9</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">ad0b2fbc1def3fcf1fa98e29460e28e67c95239</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 19</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">d17737b2de1d1d196d0121a04d8bb0876c472e</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> e2920e4c6c2c8e18334668a443cb89affd59feb7</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> blob</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ea188a38f03b5843f9c78687a887110a9e972db5</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">dangling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 6324</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">ab475307efbfa79e628a500d747a4bb3a91f</span></span></code></pre></div><h2 id="git-gc" tabindex="-1">git gc <a class="header-anchor" href="#git-gc" aria-label="Permalink to &quot;git gc&quot;">​</a></h2><p>Git gc 命令会在当前仓库中触发 Git 的垃圾回收。该命令将删除所有无法访问的（孤立的）提交，并压缩存储的 Git 对象，从而释放内存空间。Git 垃圾回收会在像 git pull、merge、rebase 和 commit 这样的命令中自动运行，但手动运行该命令可以帮助清理更新频繁的仓库。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> gc</span></span></code></pre></div><p>这是执行 git gc 命令后的一些样例输出：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Enumerating</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 6538</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Counting</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (6538/6538), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Delta</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> compression</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> using</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> up</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> to</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 8</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> threads</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Compressing</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (4045/4045), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Writing</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (6538/6538), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Total</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 6538</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (delta </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">3329</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">), reused 3413 (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">delta</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1763</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Computing</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> commit</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> graph</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> generation</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> numbers:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (546/546), done.</span></span></code></pre></div><p>请注意，在运行了 git gc 命令后再运行 git fsck，我们不会再看到任何的悬空对象：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> fsck</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Checking</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> object</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> directories:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (256/256), done.</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">Checking</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> objects:</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (6538/6538), done.</span></span></code></pre></div><h2 id="git-reflog" tabindex="-1">git reflog <a class="header-anchor" href="#git-reflog" aria-label="Permalink to &quot;git reflog&quot;">​</a></h2><p>使用 git reflog 命令可以查看本地分支的历史提交记录。默认情况下，git reflog 显示 HEAD 引用的历史信息。为了查看特定引用的 reflog，用户可以通过引用名称进行标识：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> reflog</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> show</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ref-name</span></span></code></pre></div><p>或者，用户可以执行以下命令查看所有引用的 reflog：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> reflog</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> show</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --all</span></span></code></pre></div><h2 id="git-cat-file" tabindex="-1">git cat-file <a class="header-anchor" href="#git-cat-file" aria-label="Permalink to &quot;git cat-file&quot;">​</a></h2><p>git cat-file 命令用于显示仓库中指定对象的内容或类型。用户必须提供对象的名称，可以是 blob、tree、commit 或 tag。用户需要添加以下三个标志中的一个来指定显示的内容：使用 -t 标志显示对象类型，使用 -s 标志显示对象大小，使用 -p 标志显示对象的内容。例如，可以使用 -p 显示提交的树、父提交、作者、提交者和提交消息：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> cat-file</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">commit-i</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -p</span></span></code></pre></div><h2 id="git-write-tree" tabindex="-1">git write-tree <a class="header-anchor" href="#git-write-tree" aria-label="Permalink to &quot;git write-tree&quot;">​</a></h2><p>Git write-tree 命令根据暂存区索引在对象数据库中创建一个新的树。若要根据子目录创建一个树，用户可以添加 --prefix 标志并指定子目录的名称。运行此命令后，新树的哈希值将被打印到标准输出。</p><p>例如，要基于当前仓库中的一个子目录写入一个树，用户可以执行以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> write-tree</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --prefix=subdirectoryPath</span></span></code></pre></div><h2 id="git-read-tree" tabindex="-1">git read-tree <a class="header-anchor" href="#git-read-tree" aria-label="Permalink to &quot;git read-tree&quot;">​</a></h2><p>Git read-tree 命令将一个已存在的 Git 树对象的状态复制到索引中。默认情况下，此命令不会更新现有的文件。通过添加 -m 标志，此命令也可以用于将一个或多个树合并到索引中。例如，为了将一个已存在的树合并到索引，开发者可以使用以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> read-tree</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -m</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">tree-has</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">h</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><h2 id="git-commit-tree" tabindex="-1">git commit-tree <a class="header-anchor" href="#git-commit-tree" aria-label="Permalink to &quot;git commit-tree&quot;">​</a></h2><p>Git commit-tree 命令根据提供的树创建一个新的提交对象。与普通提交不同，这种提交并不设定新的 HEAD 状态。相反，它仅根据现有树的状态创建一个提交对象，并将其内容的哈希值保存在对象数据库中。运行此命令后，commit ID 会被打印到标准输出。当用户希望在对象数据库中创建一个提交，但又不更新工作分支的历史记录时，此命令可能会很有用。</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> commit-tree</span></span></code></pre></div><h2 id="git-show-ref" tabindex="-1">git show-ref <a class="header-anchor" href="#git-show-ref" aria-label="Permalink to &quot;git show-ref&quot;">​</a></h2><p>Git show-ref 命令列出了本地仓库中所有可用的引用及其关联的 commit ID。默认情况下，此命令显示所有的 tag、head 和远程引用。如果只想显示标签，用户可以添加 --tags 标志；如果只想显示 head，可以添加 --head 标志。此命令也可以用于检查与特定模式匹配的任何现有对象。</p><p>例如，为了检查任何与名为 master 的引用匹配的情况，开发者可以使用以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> show-ref</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> master</span></span></code></pre></div><p>若要仅获取与精确路径匹配的对象，用户可以添加 --verify 标志。例如，为了定位在 refs/heads/master 的一个分支，开发者可以使用以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> show-ref</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --verify</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> refs/heads/master</span></span></code></pre></div><h2 id="git-update-ref" tabindex="-1">git update-ref <a class="header-anchor" href="#git-update-ref" aria-label="Permalink to &quot;git update-ref&quot;">​</a></h2><p>Git update-ref 命令用于使引用指向一个新的 Git 对象。例如，为了更新当前分支的 HEAD 以指向一个新的对象，开发者可以使用以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> update-ref</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> HEAD</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">new-re</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">f</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><p>如果用户想在更新当前引用之前检查新对象是否与旧对象相同，可以在命令中将旧对象的哈希值作为第三个参数。这样只有当对象的值匹配时，引用才会被更新。例如，如果新对象匹配当前对象，要更新当前分支的 HEAD 以指向新对象，开发者可以使用以下命令：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> update-ref</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> HEAD</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">new-re</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">f</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">current-re</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">f</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><h2 id="git-rev-list" tabindex="-1">git rev-list <a class="header-anchor" href="#git-rev-list" aria-label="Permalink to &quot;git rev-list&quot;">​</a></h2><p>Git rev-list 命令按照时间的逆序列出来自一个或多个引用的对象。为了从特定引用获取对象，用户可以将那个引用作为参数包含进来：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> rev-list</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">re</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">f</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span></span></code></pre></div><p>此命令还支持添加参数以指定某些对象。例如，用户可以添加 --all 标志来从所有引用获取对象，添加 --branches 标志来从所有分支 HEAD 获取对象，以及添加 --tags 标志来从所有 tag 获取对象。</p><h2 id="git-verify-pack" tabindex="-1">git verify-pack <a class="header-anchor" href="#git-verify-pack" aria-label="Permalink to &quot;git verify-pack&quot;">​</a></h2><p>git verify-pack 命令用于确认 Git packfile 的有效性。该命令要求用户提供与所查询的 Git packfile 相关联的 .idx 文件的路径。该 .idx 文件用于快速定位相关 packfile 中的对象。Git packfile 是在 Git 仓库中组织大量文件的有效方式。要获取 packfile 中所有对象的列表，用户可以添加 -v（详细）标志：</p><div class="language-shell vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> verify-pack</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> packfile.idx</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -v</span></span></code></pre></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>通过这些高级命令，开发人员可以执行管理任务，以高效地处理和维护他们的 Git 仓库。对于经常有多个用户进行贡献的仓库，这些命令可能是维护一个干净项目的必要工具。</p>`,70);function u(s,D,v,f,A,B){const l=n,h=k("ClientOnly");return t(),d("div",null,[m,r(h,null,{default:g(()=>{var i,a;return[(((i=s.$frontmatter)==null?void 0:i.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(t(),c(l,{key:0,article:s.$frontmatter},null,8,["article"])):y("",!0)]}),_:1}),b])}const x=p(C,[["render",u]]);export{q as __pageData,x as default};