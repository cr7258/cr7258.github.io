---
title: 使用 Fleet 管理 Elastic Agent 监控应用
author: Se7en
date: 2022/12/25 14:49
categories:
 - Elastic Stack 实战教程
tags:
 - Elastic Stack
 - Elasticsearch
---

# 使用 Fleet 管理 Elastic Agent 监控应用

本系列 Elastic Stack 实战教程总共涵盖 5 个实验，目的是帮助初学者快速掌握 Elastic Stack 的基本技能。
>
> [云起实验室在线体验地址](https://developer.aliyun.com/adc/scenarioSeries/24e7a7a4d56741d0bdcb3ee73c9c22f1)
>
> - 实验 1：Elastic Stack 8 快速上手
> - 实验 2：ILM 索引生命周期管理
> - 实验 3：快照备份与恢复
> - 实验 4：使用 Fleet 管理 Elastic Agent 监控应用
> - 实验 5：Elasticsearch Java API Client 开发
>

### 1 Fleet 介绍

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810155848.png)

Elastic 从 7.13 版本开始，引入 Fleet。Fleet 是 Elastic Stack 的一个组件，用于集中管理 Elastic Agent。在此之前，我们通常采用 Beats 来对应用程序进行监控。


**Beats** 是向 Elasticsearch 发送数据的轻量级数据传送器，Elastic 针对日志，指标，运行状态，网络流量等场景提供了不同类型的 Beats，例如 Filebeat，MetricBeat，HeartBeat，PacketBeat 等等。

**Elastic Agent** 是一个集成所有 Beats 功能的统一代理，通过 gRPC 管理及调用各种 Beats，你不再需要为了部署各种 Beats 而感到头疼，并且 Elastic Agent 可以通过 **Fleet** 程序来集中管理。

Fleet 由两部分组成：
-   **Fleet UI** 是一个带有可视化界面的 Kibana 应用程序，用户可以在界面配置和管理 Elastic Agent 的策略，并且在 Fleet 页面上查看所有 Elastic Agent 的状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810153731.png)

-   **Fleet Server** 负责集中管理 Elastic Agent 的策略和生命周期，它提供了用于更新 Elastic Agent 的控制平面，并指示 Elastic Agent 执行一些操作，例如更新监控策略，跨主机运行 Osquery 或在网络层隔离主机以遏制安全威胁。Fleet Server 也是一个特殊的 Elastic Agent。

我们可以创建 **Agent Policy** 并关联多个主机，来统一管理这些主机的策略，并在 Agent Policy 中添加各种 **Integration** 来集成各种功能，例如日志收集，指标监控等等。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810155042.png)

### 2 部署 Elasticsearch
在本实验中，我们准备将 Fleet Server 和 Elasticsearch 以及 Kibana 安装在同一个主机上，然后在另一台主机上安装 Elastic Agent 监控应用服务。

出于安全原因，Elasticsearch 默认不允许使用 root 用户启动。执行以下命令，创建 elastic 用户，设置密码为 elastic123 ，并切换到该用户。
```bash
useradd -s /bin/bash -m elastic
echo "elastic:elastic123" | chpasswd
su - elastic
```
下载和解压 Elasticsearch 安装文件。
```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.3.3-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.3.3-linux-x86_64.tar.gz.sha512
shasum -a 512 -c elasticsearch-8.3.3-linux-x86_64.tar.gz.sha512 
tar -xzf elasticsearch-8.3.3-linux-x86_64.tar.gz
cd elasticsearch-8.3.3/ 
```

修改 config/elasticsearch.yml 配置文件，添加以下内容，启用内置 API 密钥服务。
```bash
xpack.security.authc.api_key.enabled: true
```
执行如下命令，启动 Elasticsearch。
```bash
./bin/elasticsearch
```

启动成功后，会输出以下内容，保存好以下两个内容：
- elastic 用户密码。
- Kibana 注册 token。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809110451.png)

### 3 部署 Kibana

打开一个新的终端， 切换到 elastic 用户。
```bash
su - elastic
```
执行如下命令，下载和解压 Kibana 安装文件。
```bash
curl -O https://artifacts.elastic.co/downloads/kibana/kibana-8.3.3-linux-x86_64.tar.gz
curl https://artifacts.elastic.co/downloads/kibana/kibana-8.3.3-linux-x86_64.tar.gz.sha512 | shasum -a 512 -c - 
tar -xzf kibana-8.3.3-linux-x86_64.tar.gz
cd kibana-8.3.3/ 
```

执行以下命令，生成  saved objects encryption key。
```bash
bin/kibana-encryption-keys generate
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111247.png)

编辑 config/kibana.yml 配置文件，修改以下内容，允许 Kibana 服务监听本机所有 IP 地址。同时将生成 `xpack.encryptedSavedObjects.encryptionKey` 的添加到文件中。

```bash
server.host: "0.0.0.0"
xpack.encryptedSavedObjects.encryptionKey: c0ebc52748dd217a30af01f05d097e3f # 上面生成的结果
```

执行如下命令，启动 Kibana。
```bash
./bin/kibana
```

启动成功后，会输出以下内容。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111722.png)

浏览器输入 `http://<ESC 公网 IP>:5601/?code=978607` 访问 Kibana 界面，注意本场景中提供了两台 ECS 实例，请填写正确的 ECS 公网 IP 地址。**code=978607** 修改为上面终端输出的内容。在 **Enrollment token** 输入框中填入第 1 小节启动 Elasticsearch 后输出的 Kibana 注册 token，然后点击 **Configure Elastic**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809111920.png)

接着 Kibana 会自动完成注册设置。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809101955.png)


Kibana 注册成功后会出现登录界面，输入 **elastic** 用户名密码登录 Elasticsearch。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220619173610.png)

### 4 部署 Fleet
点击 **Management -> Fleet -> Settings -> Fleet server hosts -> Edit hosts** 添加 Fleet Server 信息。[https://10.20.61.185:8220](https://10.20.61.185:8220/) 是你准备安装 Fleet Server 的服务器地址，请根据实际情况进行修改，可以在云产品资源信息中查看 ECS 的 IP 地址（使用私有地址），Fleet Server 默认启动的端口号是 8220。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809112623.png)


然后点击左上角的 **Agents** 标签。为了方便实验，选择 **Quick Start** 模式。点击 **Generate Fleet Server Policy** 让 Fleet 为我们自动生成 Fleet Server 策略和注册令牌。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809112952.png)

在本实验中，我们将 Fleet Server 和 Elasticsearch 以及 Kibana 安装在同一个主机上，在生产环境中建议将 Fleet Server 安装在单独的主机上。复制以下命令，打开一个新的终端并执行命令。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113138.png)


当提示是否安装时，输入 **y** 确认。当出现以下内容时，表示 Fleet Server 已经安装成功。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113652.png)

可以使用 `elastic-agent status`  命令查看各个组件的运行状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113905.png)

此时重新回到 Kibana 界面可以看到 Fleet Server 已经成功连接。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809113930.png)

### 5 创建 Agent Policy
点击 **Management -> Fleet -> Agents policies -> Create agent policy** 创建一条策略用于关联 Elastic Agent 。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115005.png)
输入策略名 My Agent Policy，点击 **Create agent policy**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115119.png)

创建好的策略如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115253.png)


### 6 部署 Elastic Agent

在 Kibana 界面点击 **Management -> Fleet -> Agents -> Add agent** 添加 Elastic Agent。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809114140.png)

Elastic Agent 选择关联第 4 小节中创建的 agent policy，选择在 Fleet 中注册 Elastic Agent 实现集中管理 Elastic Agent 的效果，可以帮助我们自动更新配置到 Elastic Agent 上。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809115559.png)


然后我们在另一个主机上安装 Elastic Agent，打开一个新的终端，执行 `ssh root@<ESC 公网 IP>` 命令登录到第二台 ECS 上。

复制 Elastic Agent 的安装命令到新的主机上执行，由于 Fleet Server 用于 TLS 加密的自签名的证书，因此最后一条命令做了一点修改，在末尾添加了 `--insecure`  参数，表示允许连接到不受信任的服务器。
```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-8.3.3-linux-x86_64.tar.gz
tar xzvf elastic-agent-8.3.3-linux-x86_64.tar.gz 
cd elastic-agent-8.3.3-linux-x86_64
sudo ./elastic-agent install --url=https://10.20.61.185:8220 --enrollment-token=cGRPNmdJSUJaWFgwY01acW5rYkk6cEF4djYxbjFSM0NNOHl6czg2bS1tUQ== --insecure
```

当提示是否安装时，输入 **y** 确认。当出现以下内容时，表示 Elastic Agent 已经安装成功。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120755.png)

可以使用 `elastic-agent status`  命令查看各个组件的运行状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120846.png)


此时重新回到 Kibana 界面可以看到 Elastic Agent 已经成功连接。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120856.png)

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809120940.png)

### 7 指标监控

指标监控可以帮助我们监测 CPU，内存，磁盘，网络，进程等资源的使用情况，在第 4 小节创建 agent policy 时会自动创建一个System Integrations 用于监控系统指标，Syslog，用户，SSH 登录等信息。

点击 **Analytics -> Dashboard** 界面，搜索 metric 可以看到 Fleet 为我们自动创建的一些内置的指标监控面板。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810100009.png)


点击 **[Metrics System] Host overview** 面板，可以查看主机相关的指标监控信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095049.png)


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095112.png)

点击 **[Elastic Agent] Agent metrics** 面板可以看到 Elastic Agent 相关的指标监控信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810095741.png)

### 8 HTTP, TCP, ICMP  监控

Fleet 提供了以下几种轻量级检查来监控网络端点的状态：
- 1.**HTTP**：向服务发送 HTTP 请求，可以根据 HTTP 响应码和响应体来判断服务是否运行正常。
- 2.**TCP**：确保服务的端口正在监听。
- 3.**ICMP**：通过 ICMP 请求来检测主机的网络可达性。

接下来先创建一个 HTTP 监控，点击 **Management -> Fleet -> Agent policies -> My Agent Policy -> Add integration**，添加监控策略。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143007.png)

在搜索栏中，输入 **Elastic Synthetics**，点击  **Elastic Synthetics**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143124.png)

点击 **Add Elastic Synthetics**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143140.png)


- **Integration name** 输入 `http-1`。
- **Monitor Type** 选择 `HTTP`。
- **URL** 设置 `http://localhost:8080`，后续我们会在该端口启动一个 Web 服务。
- **Frequency** 检测频率设置为 5s。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143713.png)


- **Timeout in seconds** 检测失败的超时时间设置为 3s。
- **Agent policy** 关联 `My Agent Policy`。
- 点击 **Save and continue** 保存配置。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143727.png)

然后我们创建一个 TCP 监控。
- **Integration name** 输入 `tcp-1`。
- **Monitor Type** 选择 `TCP`。
- **Host:Port**：设置 `localhost:8090`，后续我们会在该端口启动一个 Web 服务。
-  **Frequency** 检测频率设置为 5s。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143901.png)

- **Timeout in seconds** 检测失败的超时时间设置为 3s。
- **Agent policy** 关联 `My Agent Policy`。
- 点击 **Save and continue** 保存配置。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143912.png)

最后创建一个 ICMP 监控。
- **Integration name** 输入 `icmp-1`。
- **Monitor Type** 选择 `ICMP`。
- **Host**：设置 `localhost`。
-  **Frequency** 检测频率设置为 5s。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809143957.png)

- **Timeout in seconds** 检测失败的超时时间设置为 3s。
- **Agent policy** 关联 `My Agent Policy`。
- 点击 **Save and continue** 保存配置。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144010.png)

最终我们创建完的 HTTP, TCP, ICMP 监控如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144042.png)
点击 **Observability -> Uptime -> Monitors** 界面查看刚刚创建的监控状态，可以看到 icmp-1 的状态是 Up，此时主机是网络可达的；由于目前 8080 和 8090 端口还没服务在监听，因此 http-1 和 tcp-1 的状态现在是 Down。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144154.png)

接下来我们准备在 8080 和 8090 两个端口上运行服务。为了方便部署，这里准备使用 Docker 来启动 Nginx 服务。在登录第二台 ECS 服务器的终端执行以下命令，安装 Docker。
```bash
curl -sSL https://get.daocloud.io/docker | sh
```

启动两个 Nginx 容器，将 Nginx 的 80 端口分别映射到宿主机的 8080 和 8090 端口号上。
```bash
docker run -d --name mynginx1 -p 8080:80 nginx
docker run -d --name mynginx2 -p 8090:80 nginx
```

使用 `docker ps ` 命令查看容器状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144537.png)

再次查看 Uptime Monitors 面板，可以看到 http-1 和 tcp-1 的状态已经变为 Up。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144557.png)
### 9 日志监控

Fleet 对许多软件的日志，例如 Nginx, Redis, MySQL 提供了开箱即用的支持。Fleet 会对收集的日志进行处理，并且提供内置的面板进行可视化的展示分析。在本小节中，将对 Nginx 的日志进行采集分析。

点击 **Management -> Fleet -> Agent policies -> My Agent Policy -> Add integration**，添加监控策略。在搜索栏中，输入 Nginx，点击 Nginx。
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144847.png)

点击 **Add Nginx**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809144903.png)

默认的 Nginx 监控配置如下所示。主要分为两部分：
- 1.Nginx 日志采集。
- 2.Nginx 指标监控，通过 HTTP 接口实时监测 Nginx 的连接状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145015.png)

**Integration name** 输入 nginx-1。日志采集的路径根据实际情况进行修改，这里我们保持不变。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145029.png)

指标监控也保持不变，后续会在 Nginx 的 80 端口上配置 /nginx_status 路径用于暴露 Nginx 指标监控。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810104750.png)


- **Agent policy** 关联 `My Agent Policy`。
- 点击 **Save and continue** 保存配置。

最终创建完成的 Nginx 监控如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145055.png)

接下来准备在主机上部署 Nginx 服务。在登录第二台 ECS 服务器的终端执行以下命令，安装 Nginx。
```bash
apt install -y nginx
```

编辑 Nginx 配置文件 /etc/nginx/sites-enabled/default，在默认的 80 端口的 server 配置块中添加以下配置，开启 Nginx 状态监控。
```nginx
location /nginx_status {
    stub_status;
}
```

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220818114817.png)

保存配置退出后，执行 `systemctl restart nginx` 命令重启 Nginx 服务。然后执行 `systemctl status nginx`  命令查看 Nginx 状态。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145250.png)

在本机访问 Nginx 默认监听的 80 端口。
```bash
curl http://localhost
```

响应结果如下所示，返回了 Nginx 默认的欢迎页面。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145340.png)

访问一个不存在的 URL 路径，制造 404 的错误。
```bash
curl http://localhost/mypath
```

响应结果如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809145508.png)

执行以下命令，查看 Nginx 日志。
```bash
tail -f /var/log/nginx/access.log
```
可以看到有 3 条日志，分别是第一次 200 成功访问 Nginx 的请求以及第二次 404 错误的请求。最后一条请求是 Elastic Agent 采集 Nginx 指标所产生的日志。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150225.png)

点击 **Management -> Fleet -> Data Streams** 界面，搜索 nginx，查看 Nginx 相关的监控项。点击每行右侧的 Actions 按钮可以跳转到相应的监控面板。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150311.png)

点击 **[Logs Nginx ] Access and error logs** 面板可以查看 Nginx 访问日志和错误日志。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150532.png)

点击 **[Logs Nginx ] Overview** 面板可以查看 Nginx 的日志分析。


![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150557.png)

点击 **[Metrics Nginx]Overview** 面板可以查看 Nginx 的指标监控信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150617.png)


点击 **Observability -> Logs -> Stream**  界面，点击 **Stream live** 可以实时查看日志，就像我们在主机上执行 `tail -f` 命令一样。在搜索栏可以输入过滤条件对日志进行过滤，例如输入`"data_stream.dataset":"nginx.access" and host.name:"node-2" ` 可以过滤出主机名是 node-2 上的 Nginx 访问日志。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810104242.png)


### 10 使用 Osquery 查询主机信息

Osquery 是适用于 Windows、OS X (macOS) 和 Linux 操作系统的检测框架，使我们可以像查询数据库一样查询操作系统，例如操作系统版本，进程信息，网络信息，Docker 容器信息等等。

点击 **Management -> Fleet -> Agent policies -> My Agent Policy -> Add integration**，添加监控策略。在搜索栏中搜索 **Osquery**，点击 **Osquery Manager**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150703.png)

点击 **Add Osquery Manager**。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150717.png)

- **integration name** 填写 `osquery_manager-1`
- **Agent policy** 关联 `My Agent Policy`。
- 点击 **Save and continue** 保存配置。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150734.png)

最终创建完成的 Osquery 策略如下所示。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809150809.png)

点击 **Management -> Osquery -> New live query**  新建 Osquery 查询。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220819111633.png)




在 **Agents** 选项中可以选择需要执行 Osquery 的主机，这里选择 `My Agent Policy` 关联的主机。
在 **Query** 输入框下方可以输入执行的 SQL 语句，详情可以参见 [Osquery schema](https://osquery.io/schema/5.0.1)。

接下来列举几个常用的 Osquery 示例：
- 查询操作系统版本。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151008.png)


- 查询进程。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151538.png)

查询结果也支持使用 WHERE 关键字进行过滤，例如过滤出 disk_bytes_read 大于 100000 的结果。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151637.png)

- 查询接口 IP 地址。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151109.png)

- 查询容器信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151326.png)

- 查询路由信息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220809151410.png)

查询的历史结果可以在 **Management -> Osquery -> Live queries** 中找到。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220810113729.png)
