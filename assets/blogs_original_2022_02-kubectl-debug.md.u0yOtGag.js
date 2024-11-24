import{_ as p}from"./chunks/ArticleMetadata.-S3RM9nH.js";import{_ as l,D as k,o as n,c as r,I as F,w as d,k as e,a as g,R as o,b as c,e as y}from"./chunks/framework.FHZ5yb6k.js";import"./chunks/md5.0oexlRJv.js";const E=JSON.parse('{"title":"Kubectl debug 调试容器","description":"","frontmatter":{"title":"Kubectl debug 调试容器","author":"Se7en","date":"2022/09/01 21:00","categories":["原创"],"tags":["Kubernetes","Kubectl"]},"headers":[],"relativePath":"blogs/original/2022/02-kubectl-debug.md","filePath":"blogs/original/2022/02-kubectl-debug.md","lastUpdated":1707227798000}'),C={name:"blogs/original/2022/02-kubectl-debug.md"},u=e("h1",{id:"kubectl-debug-调试容器",tabindex:"-1"},[g("Kubectl debug 调试容器 "),e("a",{class:"header-anchor",href:"#kubectl-debug-调试容器","aria-label":'Permalink to "Kubectl debug 调试容器"'},"​")],-1),D=o(`<p>调试容器化工作负载和 Pod 是每位使用 Kubernetes 的开发人员和 DevOps 工程师的日常任务。通常情况下，我们简单地使用 kubectl logs 或者 kubectl describe pod 便足以找到问题所在，但有时候，一些问题会特别难查。这种情况下，大家可能会尝试使用 kubectl exec，但有时候这样也还不行，因为 Distroless 等容器甚至不允许通过 SSH 进入 shell。那么，如果以上所有方法都失败了，我们要怎么办？</p><p>Kubernetes v1.18 版本新增的 kubectl debug 命令，允许调试正在运行的 pod。它会将名为 EphemeralContainer（临时容器）的特殊容器注入到问题 Pod 中，让我们查看并排除故障。</p><p>临时容器其实是 Pod 中的子资源，类似普通 container。但与普通容器不同的是，临时容器不用于构建应用程序，而是用于检查。 我们不会在创建 Pod 时定义它们，而使用特殊的 API 将其注入到运的行 Pod 中，来运行命令并检查 Pod 环境。除了这些不同，临时容器还缺少一些基本容器的字段，例如 ports、resources。</p><h2 id="开启临时容器功能" tabindex="-1">开启临时容器功能 <a class="header-anchor" href="#开启临时容器功能" aria-label="Permalink to &quot;开启临时容器功能&quot;">​</a></h2><p>虽然临时容器是作为 Kubernetes 核心的 Pod 规范的一部分，但很多人可能还没有听说过。这是因为临时容器处于早期 Alpha 阶段，这意味着默认情况下不启用。Alpha 阶段的资源和功能可能会出现重大变化，或者在 Kubernetes 的某个未来版本中被完全删除。因此，要使用它们必须在 kubelet 中使用 Feature Gate（特性门控）显式启用。</p><h3 id="在已经运行的-kubernetes-集群中开启临时容器功能" tabindex="-1">在已经运行的 Kubernetes 集群中开启临时容器功能 <a class="header-anchor" href="#在已经运行的-kubernetes-集群中开启临时容器功能" aria-label="Permalink to &quot;在已经运行的 Kubernetes 集群中开启临时容器功能&quot;">​</a></h3><p>编辑 /etc/manifests/kube-apiserver.yaml 文件，添加 <code>EphemeralContainers=true</code> 开启临时容器功能，如果要开启多个特性门控功能用 <code>,</code> 隔开：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">-</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --feature-gates=DynamicKubeletConfig=true,EphemeralContainers=true</span></span></code></pre></div><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210629221036.png" alt=""></p><h3 id="在初始化-kubernetes-集群时开启临时容器功能" tabindex="-1">在初始化 Kubernetes 集群时开启临时容器功能 <a class="header-anchor" href="#在初始化-kubernetes-集群时开启临时容器功能" aria-label="Permalink to &quot;在初始化 Kubernetes 集群时开启临时容器功能&quot;">​</a></h3><p>如果想在 kubeadm 初始化 Kubernetes 集群时开启临时容器功能，则修改 kubeadm 配置文件：</p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># init-k8s.yaml </span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">apiVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">kubeadm.k8s.io/v1beta2</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">kind</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">ClusterConfiguration</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">kubernetesVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">v1.20.2</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">apiServer</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">  extraArgs</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#8DDB8C;">    feature-gates</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">EphemeralContainers=true</span></span></code></pre></div><p>然后通过 kubeadm init 初始化 Kubernetes 集群：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">kubeadm</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> init</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --config</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> init-k8s.yaml</span></span></code></pre></div><h2 id="通过-pod-副本调试" tabindex="-1">通过 Pod 副本调试 <a class="header-anchor" href="#通过-pod-副本调试" aria-label="Permalink to &quot;通过 Pod 副本调试&quot;">​</a></h2><p>当故障容器不包括必要的调试工具甚至 shell 时，我们可以使用 <code>--copy-to</code> 指令复制出一个新的 Pod 副本，然后通过 <code>--share-processes</code> 指令使 <a href="https://kubernetes.io/zh/docs/tasks/configure-pod-container/share-process-namespace/" target="_blank" rel="noreferrer">Pod 中的容器之间共享进程命名空间</a>。进程共享的一个问题是它不能应用于现有的 Pod，因此我们必须创建一个新 Pod。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 启动普通 Nginx Pod</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> kubectl run nginx-app --image=nginx --restart=Never</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 启动临时容器，使用 Process Sharing（进程共享）来使用注入的临时容器检查 Pod 的原有容器。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># nginx-app 是普通 Pod 的名字，nginx-app-debug 是用于调试的 Pod 的名字，nginx-container-debug 是用于调试的 Pod 里的容器名，这里可以省略</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> kubectl debug -it nginx-app \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">--image</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">busybox</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> --share-processes</span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;"> \\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">--copy-to=nginx-app-debug </span><span style="--shiki-light:#005CC5;--shiki-dark:#F47067;">\\</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">--container=nginx-container-debug</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 在临时容器可以看到 Nginx 容器的进程和文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">/</span><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"> # ps ax</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">PID</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   USER</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">     TIME</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  COMMAND</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> root</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /pause</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    6</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> root</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> master</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -g</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> daemon</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> off</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   35</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   36</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   37</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   38</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   39</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   40</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   41</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   42</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 101</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nginx:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> worker</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> process</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   43</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> root</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> sh</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   48</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> root</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">      0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">:00</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ps</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ax</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">/</span><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"> # cat /proc/6/root/etc/nginx/conf.d/default.conf</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">server</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    listen</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">       80</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    listen</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">  [::]:80;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    server_name</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  localhost</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">    #access_log  /var/log/nginx/host.access.log  main;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    location</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        root</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   /usr/share/nginx/html</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        index</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  index.html</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> index.htm</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">......</span></span></code></pre></div><p>上面的代码表明，通过进程共享，我们可以看到 Pod 中另一个容器内的所有内容，包括其进程和文件，这对于调试来说非常方便。如果我们从另一个终端列出正在运行的 Pod，我们将看到以下内容：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">❯</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> get</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> pod</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">NAME</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">                           READY</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   STATUS</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    RESTARTS</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   AGE</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">nginx-app</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">                       1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">/1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">     Running</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">   0</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">          3</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">m23s</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">nginx-app-debug</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">                 2</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">/2</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">     Running</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">   0</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">          3</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">m10s</span></span></code></pre></div><p>这就是我们在原始应用程序 Pod 上的新调试 Pod。与原始容器相比，它有 2 个容器，因为它还包括临时容器。此外，如果想在任何时候验证 Pod 中是否允许进程共享，那么可以运行：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">❯</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> get</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> pod</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> some-app-debug</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> json</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">  |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> jq</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> .spec.shareProcessNamespace</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">true</span></span></code></pre></div><h2 id="在创建-pod-副本时改变-pod-运行的命令" tabindex="-1">在创建 Pod 副本时改变 Pod 运行的命令 <a class="header-anchor" href="#在创建-pod-副本时改变-pod-运行的命令" aria-label="Permalink to &quot;在创建 Pod 副本时改变 Pod 运行的命令&quot;">​</a></h2><p>有时更改容器的命令很有用，例如调试崩溃的容器。为了模拟应用崩溃的场景，使用 kubectl run 命令创建一个立即退出的容器：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --image=busybox</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> myapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> false</span></span></code></pre></div><p>使用 kubectl describe pod myapp 命令，可以看到容器崩溃了：</p><p><img src="https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210629222444.png" alt=""></p><p>此时可以使用 kubectl debug 命令创建该 Pod 的一个副本， 在该副本中将命令改变为交互式 shell：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 这里 --container 不能省略</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">❯</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> debug</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> myapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> -it</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --copy-to=myapp-debug</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --container=myapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> sh</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">If</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> you</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> don&#39;t see a command prompt, try pressing enter.</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">/ #</span></span></code></pre></div><p>现在就有了一个可以执行类似检查文件系统路径或者手动运行容器命令的交互式 shell。</p><h2 id="创建-pod-副本时更改容器镜像" tabindex="-1">创建 Pod 副本时更改容器镜像 <a class="header-anchor" href="#创建-pod-副本时更改容器镜像" aria-label="Permalink to &quot;创建 Pod 副本时更改容器镜像&quot;">​</a></h2><p>在某些情况下，你可能想从正常生产容器镜像中把行为异常的 Pod 改变为包含调试版本或者附加应用的镜像。</p><p>下面的例子，用 kubectl run 创建一个 Pod：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> myapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --image=busybox</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --restart=Never</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> sleep</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">d</span></span></code></pre></div><p>现在可以使用 kubectl debug 创建一个副本 并改变容器镜像为 ubuntu：</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> debug</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> myapp</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --copy-to=myapp-debug</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --set-image=myapp=ubuntu</span></span></code></pre></div><p>--set-image=myapp=ubuntu 指令中 myapp 是容器名，ubuntu 是新的容器镜像。</p><h2 id="调试集群节点" tabindex="-1">调试集群节点 <a class="header-anchor" href="#调试集群节点" aria-label="Permalink to &quot;调试集群节点&quot;">​</a></h2><p>kubectl debug 允许通过创建 Pod 来调试节点，该 Pod 将在指定节点上运行，节点的根文件系统安装在 /root 目录中。我们甚至可以用 chroot 访问主机二进制文件，这本质上充当了节点的 SSH 连接：</p><p>查看 Kubernetes 集群的节点，我们准备调试 k8s-calico-master 节点。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">❯</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> get</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> nodes</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">NAME</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">                STATUS</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   ROLES</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    AGE</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   VERSION</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">k8s-calico-master</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   Ready</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    master</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">   7</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    v1.17.3</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">k8s-calico-node01</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   Ready</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">non</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">   7</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    v1.17.3</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">k8s-calico-node02</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">   Ready</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    &lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">non</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">e</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">   7</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">d</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">    v1.17.3</span></span></code></pre></div><p>使用 node/... 作为参数显式运行 kubectl debug 以访问我们集群的节点。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">❯</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> kubectl</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> debug</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> node/k8s-calico-master</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">  -it</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --image=ubuntu</span></span></code></pre></div><p>当连接到Pod后，使用 chroot /host 突破 chroot，并完全进入主机。可以获取到节点完全的权限，查看到节点所有的文件，甚至重启节点。</p><div class="language-sh vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sh</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">root@k8s-calico-master:/etc#</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> chroot</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /host</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;"># 查看节点文件</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">sh-4.2#</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> cd</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> /etc/kubernetes/manifests/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">sh-4.2#</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ls</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">etcd.yaml</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  kube-apiserver.yaml</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">	kube-controller-manager.yaml</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">  kube-scheduler.yaml</span></span></code></pre></div><h2 id="参考链接" tabindex="-1">参考链接 <a class="header-anchor" href="#参考链接" aria-label="Permalink to &quot;参考链接&quot;">​</a></h2><ul><li><a href="https://mp.weixin.qq.com/s/uZZvsqDuqM36HB5lVyO9iA" target="_blank" rel="noreferrer">https://mp.weixin.qq.com/s/uZZvsqDuqM36HB5lVyO9iA</a></li><li><a href="https://kubernetes.io/zh/docs/reference/command-line-tools-reference/feature-gates/" target="_blank" rel="noreferrer">https://kubernetes.io/zh/docs/reference/command-line-tools-reference/feature-gates/</a></li><li><a href="https://kubernetes.io/zh/docs/concepts/workloads/pods/ephemeral-containers/" target="_blank" rel="noreferrer">https://kubernetes.io/zh/docs/concepts/workloads/pods/ephemeral-containers/</a></li><li><a href="https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core" target="_blank" rel="noreferrer">https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.21/#ephemeralcontainer-v1-core</a></li><li><a href="https://kubernetes.io/zh/docs/tasks/configure-pod-container/share-process-namespace/" target="_blank" rel="noreferrer">https://kubernetes.io/zh/docs/tasks/configure-pod-container/share-process-namespace/</a></li></ul>`,46);function b(s,m,v,A,B,f){const h=p,t=k("ClientOnly");return n(),r("div",null,[u,F(t,null,{default:d(()=>{var i,a;return[(((i=s.$frontmatter)==null?void 0:i.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(n(),c(h,{key:0,article:s.$frontmatter},null,8,["article"])):y("",!0)]}),_:1}),D])}const q=l(C,[["render",b]]);export{E as __pageData,q as default};