const e=JSON.parse('[{"title":"Kubenetes 高可用集群搭建","author":"Se7en","date":"2022/10/01 22:36","categories":["原创"],"tags":["Kubernetes"],"path":"blogs/original/2022/01-kubernetes-setup"},{"title":"Kubectl debug 调试容器","author":"Se7en","date":"2022/09/01 21:00","categories":["原创"],"tags":["Kubernetes","Kubectl"],"path":"blogs/original/2022/02-kubectl-debug"},{"title":"Kubernetes 中的对象是如何删除的：Finalizers 字段介绍","author":"Se7en","date":"2022/09/03 20:00","categories":["原创"],"tags":["Kubernetes"],"path":"blogs/original/2022/03-finalizer"},{"title":"使用 ezctl 工具部署和管理 Kubernetes 集群","author":"Se7en","date":"2022/04/03 20:00","categories":["原创"],"tags":["Kubernetes"],"path":"blogs/original/2022/04-kubeasz"},{"title":"Docker Rootless 在非特权模式下运行 Docker","author":"Se7en","date":"2022/03/03 20:00","categories":["原创"],"tags":["Docker"],"path":"blogs/original/2022/05-docker-rootless"},{"title":"Kafka 生产环境部署指南","author":"Se7en","date":"2022/05/03 20:00","categories":["原创"],"tags":["Kafka"],"path":"blogs/original/2022/06-kafka-setup"},{"title":"如何往 Kafka 发送大消息？","author":"Se7en","date":"2022/05/04 20:00","categories":["原创"],"tags":["Kafka"],"path":"blogs/original/2022/07-kafka-big-message"},{"title":"如何重置 Kafka 中的 Consumer Offset？","author":"Se7en","date":"2022/05/06 20:00","categories":["原创"],"tags":["Kafka"],"path":"blogs/original/2022/08-reset-kafka-consumer-offset"},{"title":"Pulsar 介绍与部署","author":"Se7en","date":"2022/02/03 20:00","categories":["原创"],"tags":["Pulsar"],"path":"blogs/original/2022/09-pulsar"},{"title":"Habor 部署指南","author":"Se7en","date":"2022/09/03 20:00","categories":["原创"],"tags":["Harbor"],"path":"blogs/original/2022/10-harbor"},{"title":"Nebula 分布式图数据库介绍","author":"Se7en","date":"2022/04/03 20:00","categories":["原创"],"tags":["Nebula"],"path":"blogs/original/2022/11.nebula"},{"title":"实现 LRU 缓存算法","author":"Se7en","date":"2022/09/03 20:00","categories":["原创"],"tags":["Algorithm"],"path":"blogs/original/2022/12.lru"},{"title":"使用 Envoy 作为前端代理","author":"Se7en","date":"2022/05/03 20:00","categories":["原创"],"tags":["Envoy"],"path":"blogs/original/2022/13-envoy-quickstart"},{"title":"ArgoCD 简明教程","author":"Se7en","date":"2023/11/01 22:36","categories":["原创"],"tags":["ArgoCD","DevOps"],"path":"blogs/original/2023/01-argocd-quickstart"},{"title":"WebAssembly 在云原生中的实践指南","author":"Se7en","date":"2023/10/07 22:36","categories":["原创"],"tags":["WebAssembly"],"path":"blogs/original/2023/02-wasm-in-cloud-native"},{"title":"使用 Kubectl Patch 命令更新资源","author":"Se7en","date":"2023/07/01 22:00","categories":["原创"],"tags":["Kubernetes","Kubectl"],"path":"blogs/original/2023/03-kubectl-patch"},{"title":"在 Kubernetes 中使用 Keycloak OIDC Provider 对用户进行身份验证","author":"Se7en","date":"2023/03/02 22:00","categories":["原创"],"tags":["Kubernetes","OIDC","Keycloak"],"path":"blogs/original/2023/04-kubernetes-keycloak-oidc"},{"title":"Kubernetes 多集群网络方案系列 1 -- Submariner 介绍","author":"Se7en","date":"2023/04/02 22:00","categories":["原创"],"tags":["Submariner","Multi-Cluster"],"path":"blogs/original/2023/05-kubernetes-multi-cluster-1"},{"title":"Kubernetes 多集群网络方案系列 2 -- Submariner 监控","author":"Se7en","date":"2023/04/02 22:00","categories":["原创"],"tags":["Submariner","Multi-Cluster"],"path":"blogs/original/2023/06-kubernetes-multi-cluster-2"},{"title":"vCluster -- 基于虚拟集群的多租户方案","author":"Se7en","date":"2023/01/02 22:00","categories":["原创"],"tags":["vCluster","Multi-Cluster"],"path":"blogs/original/2023/07-vcluster"},{"title":"Cilium 多集群 Cluster Mesh 介绍","author":"Se7en","date":"2023/01/08 22:00","categories":["原创"],"tags":["Cilium","Multi-Cluster"],"path":"blogs/original/2023/08-cilium-cluster-mesh"},{"title":"使用 ClusterResourceSet 为 Cluster API 集群自动安装 CNI 插件","author":"Se7en","date":"2023/05/08 22:00","categories":["原创"],"tags":["Cluster API"],"path":"blogs/original/2023/09-clusterresourceset"},{"title":"使用 Containerlab + Kind 快速部署 Cilium BGP 环境","author":"Se7en","date":"2023/07/08 18:00","categories":["原创"],"tags":["Cilium","Containerlab"],"path":"blogs/original/2023/10-cilium-bgp"},{"title":"Crossplane 实战：构建统一的云原生控制平面","author":"Se7en","date":"2024/05/05 10:44","categories":["原创"],"tags":["Crossplane","Platform Engineering"],"path":"blogs/original/2024/01-crossplane"},{"title":"深入剖析 Kubernetes 原生 Sidecar 容器","author":"Se7en","date":"2024/05/31 13:30","categories":["原创"],"tags":["Kubernetes","Sidecar","Istio"],"path":"blogs/original/2024/02-sidecar-containers"},{"title":"使用 Higress AI 插件对接通义千问大语言模型","author":"Se7en","date":"2024/09/20 13:30","categories":["原创"],"tags":["Higress","AI"],"path":"blogs/original/2024/03-higress-ai-plugins"},{"title":"一文带你入门 MCP（模型上下文协议）","author":"Se7en","date":"2025/01/07 13:30","categories":["AI"],"tags":["MCP","AI"],"path":"blogs/original/2025/01-mcp"},{"title":"MCP Server 开发实战：无缝对接 LLM 和 Elasticsearch","author":"Se7en","date":"2025/01/13 13:30","categories":["AI"],"tags":["MCP","AI"],"path":"blogs/original/2025/02-elasticsearch-mcp-server"},{"title":"快速上手：实现你的第一个 MCP Client","author":"Se7en","date":"2025/02/03 20:30","categories":["AI"],"tags":["MCP","AI"],"path":"blogs/original/2025/03-mcp-client"},{"title":"构建基于 SSE 协议通信的 MCP Server 和 Client","author":"Se7en","date":"2025/02/09 00:30","categories":["AI"],"tags":["MCP","AI"],"path":"blogs/original/2025/04-mcp-sse"},{"title":"Kubernetes 中数据包的生命周期 -- 第 1 部分","author":"Se7en","date":"2023/08/01 22:36","categories":["翻译"],"tags":["Kubernetes"],"path":"blogs/translate/2023/01-life-of-a-packet-in-kubernetes-part-1"},{"title":"Kubernetes 中数据包的生命周期 -- 第 2 部分","author":"Se7en","date":"2023/08/01 22:36","categories":["翻译"],"tags":["Kubernetes"],"path":"blogs/translate/2023/02-life-of-a-packet-in-kubernetes-part-2"},{"title":"Kubernetes 中数据包的生命周期 -- 第 3 部分","author":"Se7en","date":"2023/08/01 22:36","categories":["翻译"],"tags":["Kubernetes"],"path":"blogs/translate/2023/03-life-of-a-packet-in-kubernetes-part-3"},{"title":"Kubernetes 中数据包的生命周期 -- 第 4 部分","author":"Se7en","date":"2023/08/01 22:36","categories":["翻译"],"tags":["Kubernetes"],"path":"blogs/translate/2023/04-life-of-a-packet-in-kubernetes-part-4"},{"title":"Git 速查表：初学者必备的 12 个 Git 命令","author":"Se7en","date":"2023/09/01 22:00","categories":["翻译"],"tags":["Git"],"path":"blogs/translate/2023/05-git-cheat-sheet-1"},{"title":"Git 速查表：中级用户必备的 12 个 Git 命令","author":"Se7en","date":"2023/09/01 22:00","categories":["翻译"],"tags":["Git"],"path":"blogs/translate/2023/06-git-cheat-sheet-2"},{"title":"Git 速查表：专家必备的 14 个 Git 命令","author":"Se7en","date":"2023/09/01 22:00","categories":["翻译"],"tags":["Git"],"path":"blogs/translate/2023/07-git-cheat-sheet-3"},{"title":"Git 速查手册","author":"Se7en","date":"2024/08/01 10:00","categories":["个人速查手册"],"tags":["Git"],"path":"categories/fragments/个人速查手册/01-git"},{"title":"5 种快速查找容器中文件的方法","author":"Se7en","date":"2024/07/20 19:00","categories":["个人速查手册"],"tags":["Docker"],"path":"categories/fragments/个人速查手册/02-find-docker-file"},{"title":"IDEA 快捷键","author":"Se7en","date":"2024/12/08 19:00","categories":["IDE 快捷键"],"tags":["IDE 快捷键"],"path":"categories/fragments/个人速查手册/03-idea-shortcut"},{"title":"使用 ClashX 代理 SSH 连接","author":"Se7en","date":"2024/12/27 22:00","categories":["SSH"],"tags":["SSH","代理"],"path":"categories/fragments/个人速查手册/04-ssh-proxy"},{"title":"Docker 常用命令","author":"Se7en","date":"2024/12/32 19:00","categories":["个人速查手册"],"tags":["Docker"],"path":"categories/fragments/个人速查手册/05-docker-command"},{"title":"eBPF","author":"Se7en","date":"2024/12/07 10:00","categories":["Bug万象集"],"tags":["eBPF"],"path":"categories/issues/Bug万象集/ 01-ebpf"},{"title":"IDE","author":"Se7en","date":"2024/12/12 10:00","categories":["IDE"],"tags":["IDE"],"path":"categories/issues/Bug万象集/02-ide"},{"title":"AI","author":"Se7en","categories":["AI"],"tags":["AI","GPU"],"path":"categories/learning/AI/01-ai"},{"title":"GPU","author":"Se7en","categories":["GPU"],"tags":["GPU"],"path":"categories/learning/AI/02-gpu"},{"title":"PyTorch","author":"Se7en","categories":["PyTorch","AI"],"tags":["PyTorch"],"path":"categories/learning/AI/03-pytorch"},{"title":"Model Context Protocol（MCP）","author":"Se7en","categories":["AI"],"tags":["AI","MCP"],"path":"categories/learning/AI/04-mcp"},{"title":"AI Gateway","author":"Se7en","categories":["AI"],"tags":["AI","Gateway"],"path":"categories/learning/AI/05-ai-gateway"},{"title":"eBPF 基础","author":"Se7en","categories":["eBPF"],"tags":["eBPF"],"path":"categories/learning/eBPF/01-ebpf"},{"title":"bpftool","author":"Se7en","categories":["eBPF"],"tags":["eBPF"],"path":"categories/learning/eBPF/02-bpftool"},{"title":"Istio","author":"Se7en","categories":["Istio","Service Mesh"],"tags":["Istio"],"path":"categories/learning/云原生/01-istio"},{"title":"Observability","author":"Se7en","categories":["Observability"],"tags":["Observability"],"path":"categories/learning/云原生/02-observability"},{"title":"Rust","author":"Se7en","categories":["Programming"],"tags":["Rust"],"path":"categories/learning/编程语言/01-rust"},{"title":"Go 并发编程","author":"Se7en","categories":["Programming"],"tags":["Go","Concurrency"],"path":"categories/learning/编程语言/02-golang-concurrency"},{"title":"Go GMP","author":"Se7en","categories":["Programming"],"tags":["Go","GMP"],"path":"categories/learning/编程语言/02-golang-gmp"},{"title":"设计模式","author":"Se7en","categories":["Programming","Design Pattern"],"tags":["Design Pattern"],"path":"categories/learning/编程语言/03-design-pattern"},{"title":"AI","author":"Se7en","categories":["AI"],"tags":["AI","Open Source"],"path":"categories/open-source/开源项目/01-ai"},{"title":"Web","author":"Se7en","categories":["Web"],"tags":["Web","Open Source"],"path":"categories/open-source/开源项目/02-web"},{"title":"查询 Kubernetes 核心资源字段","author":"Se7en","date":"2024/12/15 22:00","categories":["Tool"],"tags":["Cloud Native"],"path":"categories/tools/云原生/01-k8s-resource"},{"title":"Windsurf 下一代 AI IDE","author":"Se7en","date":"2024/10/01 22:36","categories":["Programming"],"tags":["IDE","AI"],"path":"categories/tools/编程工具/01-windsurf"},{"title":"Hot 100 算法题","author":"Se7en","categories":["Algorithm"],"tags":["Algorithm"],"path":"courses/algorithm/算法/01-hot100"},{"title":"算法解题套路框架","author":"Se7en","categories":["Algorithm"],"tags":["Algorithm"],"path":"courses/algorithm/算法/02-template"},{"title":"经典设计问题","author":"Se7en","categories":["Algorithm"],"tags":["Algorithm"],"path":"courses/algorithm/算法/03-solve-real-problem"},{"title":"Elastic Stack 8 快速上手","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"courses/elastic-stack/Elastic Stack 实战教程/01-quick-start"},{"title":"ILM 索引生命周期管理","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"courses/elastic-stack/Elastic Stack 实战教程/02-ilm"},{"title":"快照备份与恢复","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"courses/elastic-stack/Elastic Stack 实战教程/03-snapshot"},{"title":"使用 Fleet 管理 Elastic Agent 监控应用","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"courses/elastic-stack/Elastic Stack 实战教程/04-fleet"},{"title":"Elasticsearch Java API Client 开发","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"courses/elastic-stack/Elastic Stack 实战教程/05-java-client"},{"title":"AI","author":"Se7en","categories":["Interview"],"tags":["AI"],"path":"courses/interview/AI/01-ai"},{"title":"Elasticsearch","author":"Se7en","categories":["Interview"],"tags":["Elasticsearch"],"path":"courses/interview/Elastic Stack/01-elasticsearch"},{"title":"Kubernetes","author":"Se7en","categories":["Interview"],"tags":["Kubernetes"],"path":"courses/interview/云原生/01-kubernetes"},{"title":"容器","author":"Se7en","categories":["Interview"],"tags":["Container"],"path":"courses/interview/云原生/02-container"},{"title":"存储","author":"Se7en","categories":["Interview"],"tags":["Storage"],"path":"courses/interview/云原生/03-storage"},{"title":"网络","author":"Se7en","categories":["Interview"],"tags":["Network"],"path":"courses/interview/云原生/04-network"},{"title":"安全","author":"Se7en","categories":["Interview"],"tags":["Security"],"path":"courses/interview/云原生/05-security"},{"title":"发布","author":"Se7en","categories":["Interview"],"tags":["Rollout"],"path":"courses/interview/云原生/06-rollout"},{"title":"Operator","author":"Se7en","categories":["Interview"],"tags":["Operator","Client-Go","Controller-Runtime"],"path":"courses/interview/云原生/07-operator"},{"title":"消息队列","author":"Se7en","categories":["Interview"],"tags":["Message Queue"],"path":"courses/interview/大数据/01-message-queue"},{"title":"CPU","author":"Se7en","categories":["Interview"],"tags":["Operating System","CPU"],"path":"courses/interview/操作系统/01-cpu"},{"title":"内存","author":"Se7en","categories":["Interview"],"tags":["Operating System","Memory"],"path":"courses/interview/操作系统/02-memory"},{"title":"存储","author":"Se7en","categories":["Interview"],"tags":["Operating System","Storage"],"path":"courses/interview/操作系统/03-storage"},{"title":"网络","author":"Se7en","categories":["Interview"],"tags":["Network"],"path":"courses/interview/操作系统/04-network"},{"title":"cgroup","author":"Se7en","categories":["Interview"],"tags":["Operating System","cgroup"],"path":"courses/interview/操作系统/05-cgroup"},{"title":"Golang","author":"Se7en","categories":["Interview"],"tags":["Golang"],"path":"courses/interview/编程语言/01-golang"},{"title":"数据结构与算法","author":"Se7en","categories":["Interview"],"tags":["Algorithm"],"path":"courses/interview/编程语言/02-algorithm"},{"title":"Elastic Stack 8 快速上手","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"en/courses/elastic-stack/01-elastic-stack-hands-on-lab/01-quick-start"},{"title":"ILM 索引生命周期管理","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"en/courses/elastic-stack/01-elastic-stack-hands-on-lab/02-ilm"},{"title":"快照备份与恢复","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"en/courses/elastic-stack/01-elastic-stack-hands-on-lab/03-snapshot"},{"title":"使用 Fleet 管理 Elastic Agent 监控应用","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"en/courses/elastic-stack/01-elastic-stack-hands-on-lab/04-fleet"},{"title":"Elasticsearch Java API Client 开发","author":"Se7en","date":"2022/12/25 14:49","categories":["Elastic Stack 实战教程"],"tags":["Elastic Stack","Elasticsearch"],"path":"en/courses/elastic-stack/01-elastic-stack-hands-on-lab/05-java-client"},{"title":"CNI (Container Network Interface)","author":"Se7en","date":"2024/05/24 22:00","categories":["Meetup"],"tags":["CNI","Network"],"path":"meetup/network/01-network/01-cni"}]');export{e as d};
