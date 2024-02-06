---
title: Kafka 生产环境部署指南
author: Se7en
date: 2022/05/03 20:00
categories:
 - 原创
tags:
 - Kafka
---

# Kafka 生产环境部署指南

## 1 Kafka 基本概念和系统架构

在 Kafka 集群中存在以下几种节点角色：
* **Producer**：生产者，生产消息并推送到 Kafka 集群中。
* **Consumer**：消费者，从 Kafka 集群中拉取并消费消息。可以将一个和多个 Consumer 指定为一个 Consumer Group（消费者组），一个消费者组在逻辑上是一个订阅者，不同消费者组之间可以消费相同的数据，消费者组之间互不干扰。
* **Broker**：一台 Kafka 服务器就是一个 Broker，一个 Kafka 集群由多个 Broker 组成。
* **Controller**：Kafka 集群中的其中一台 Broker，负责集群中的成员管理和 Topic 管理。
* **Zookeeper**：Kafka 集群通过外部的 Zookeeper 来协调管理节点角色，存储集群的元数据信息。不过在 Kafka 2.8 版本开始可以不用 Zookeeper 作为依赖组件了，官网把这种模式称为 KRaft 模式，Kafka 使用的内置共识机制进行集群选举并且将元数据信息保存在 Kafka 集群中。

![](https://img-blog.csdnimg.cn/img_convert/c705f1064c4e5a5cdf40b3fd17989714.png)

在 Kafka 中，**副本（Replica）** 分成两类：领导者副本（Leader Replica）和追随者副本（Follower Replica）。
* **Leader Replica**：每个分区在创建时都要选举一个副本，称为 Leader 副本，其余的副本称为 Follower 副本。
* **Follower Replica**：从 Leader 副本中实时同步数据，当 Leader 副本发生故障时，某个 Follower 副本会提升为 Leader。在 Kafka 中，Follower 副本是不对外提供服务的。也就是说，只有 Leader 副本才可以响应消费者和生产者的读写请求。

![](https://img-blog.csdnimg.cn/img_convert/32eb554ef485bbd577b5b072747e12ca.png)

* **Record**：Kafka 是消息引擎，这里的消息就是指 Kafka 处理的主要对象。
* **Topic**：主题是承载消息的逻辑容器，在实际使用中多用来区分具体的业务。
* **Consumer Offset**：消费者位移，表示消费者的消费进度，每个消费者都有自己的消费者位移。
* **Rebalance**：重平衡，消费者组内某个消费者实例挂掉后，其他消费者实例自动重新分配订阅主题分区的过程。Rebalance 是 Kafka 消费者端实现高可用的重要手段。

![](https://img-blog.csdnimg.cn/img_convert/1fbdc38eadccd82251523552636ca399.png)

## 2 集群容量预估
* 假设 Kafka 集群每日需要承载 10 亿条数据，每条数据的大小大概是 10 KB，一天的数据总量约等于 10 TB。
* 为了数据的可靠性保证，我们设置 3 副本，每天的数据量为 10 * 3 = 30 TB。
* Kafka 支持数据的压缩，假设压缩比是 0.75，那么我们每天实际需要的存储空间是 30 * 0.75 = 22.5 TB。
* 通常情况下我们会在 Kafka 中保留 7 天的数据，方便在出现问题时回溯重新消费，那么保存 7 天数据需要的存储空间是 22.5 * 7 = 157.5 TB。
* 一般情况下 Kafka 集群除了消息数据还有其他类型的数据，比如索引数据等，故我们再为这些数据预留出 10% 的磁盘空间，因此最终需要的存储空间为 157.5 / 0.9 = 175 TB。
* 根据二八法则估计，10 亿条数据中的 80%（8亿）会在一天中的 20%（4.8小时） 的时间中涌入。也就是说一天中的高峰时期 Kafka 集群需要扛住每秒 (10^9 * 0.8) / (24 * 0.2 * 60 * 60) = 4.6 万次的并发。
* 单台物理机可以扛住 4 ~ 5 万的并发，通常建议高峰时期的 QPS 控制在集群能够承载的 QPS 的 30% 左右，加上基于高可用的考量，这里选择使用 3 台 Kafka 物理机搭建集群。
* 3 台物理机，总共 175 TB 数据，平均每台机器 175 / 3 = 58 TB 数据，每台物理机使用 15 块 4 TB 的硬盘。

总之在规划磁盘容量时你需要考虑下面这几个元素：
* 新增消息数。
* 消息留存时间。
* 平均消息大小。
* 副本数。
* 是否启用压缩。

## 3 资源评估


### 3.1 硬盘
SSD 固态硬盘比机械硬盘快主要体现在随机读写方面，比如 MySQL 中经常需要对硬盘进行随机读写，就要用到 SSD 固态硬盘。而 Kafka 在写磁盘的时候是 append-only 顺序追加写入的，而机械硬盘顺序读写的性能和内存是差不多的，所以对于 Kafka 集群来说使用机械硬盘就可以了。

关于磁盘选择另一个经常讨论的话题就是到底是否应该使用磁盘阵列（RAID）。使用 RAID 的两个主要优势在于：
* 提供冗余的磁盘存储空间。
* 提供负载均衡。

不过就 Kafka 而言，一方面 Kafka 自己实现了冗余机制来提供高可靠性；另一方面通过分区的概念，Kafka 也能在软件层面自行实现负载均衡。因此可以不搭建 RAID，使用普通磁盘组成的存储空间即可。


### 3.2 内存

Kafka 自身的 JVM 是用不了过多堆内存的，因为 Kafka 设计就是规避掉用 JVM 对象来保存数据，避免频繁 Full GC 导致的问题。建议设置 Kafka 的 JVM 堆内存为 6G，这是业界比较公认的一个合理的值。Kafka 会大量用到 Page Cache 来提升读写效率，将剩下的系统内存都作为 Page Cache 空间。这里建议最少选择 64G 内存的服务器，当然如果是 128G 内存那就更好了，这样可以放更多数据到 Page Cache 中。

### 3.3 CPU

通常情况下 Kafka 不太占用 CPU，CPU 不是性能的瓶颈。Kafka 的服务器一般是建议 16 核，当然如果可以给到 32 核那就最好不过了。

### 3.4 网络
对于 Kafka 这种通过网络大量进行数据传输的框架而言，带宽特别容易成为瓶颈。在高峰期每秒涌入 4.6 万条数据的情况下，每条数据 10 KB，每秒的数据量是 4.6 * 10000 * 10 * 1000 = 460 MB。现在数据中心中的交换机通常是千兆和万兆带宽，但是这里需要注意的是交换机中的千兆和万兆带宽的单位是 bit（位），我们刚才计算的每秒的数据量的单位是 Byte（字节），换算成 bit 需要乘 8，因此每秒的数据量是 460 * 8 = 3680 Mb，所以我们的网络应该至少是万兆。

### 3.5 文件系统

Kafka 在生产环境中建议部署在 Linux 操作系统上，根据官网的测试报告，XFS 的性能要强于 ext4，因此生产环境建议使用 XFS 文件系统。

## 4 系统参数设置
### 4.1 文件描述符
Kafka 会读写大量的文件并且和客户端建立大量的 Socket 连接，在 Linux 系统中一切皆文件，这些操作都需要使用大量的文件描述符。
默认 Linux 系统只允许每个线程使用 1024 个文件描述符，这对 Kafka 来说显然是不够的，因此需要增加线程可以使用的文件描述符到 100000。
```sh
#编辑配置文件 /etc/security/limits.conf  (永久生效)
* - nofile 100000

#命令行执行（当前会话生效）
ulimit -n 100000
```

### 4.2 线程数

Kafka 中主要有以下几类线程：
* Kafka 在网络层采用的是 Reactor 模式，是一种基于事件驱动的模式。其中有 3种线程：
    * **Acceptor 线程**：1个接收线程，负责监听新的连接请求，同时注册 OP_ACCEPT 事件，将新的连接按照轮询的方式交给对应的 Processor 线程处理。
    * **Processor 线程**：N 个 处理器线程，其中每个 Processor 都有自己的 selector，它会向 Acceptor 分配的 SocketChannel 注册相应的 OP_READ 事件，N 的大小由`num.networker.threads` 参数决定。
    * **KafkaRequestHandler 线程**：M 个 请求处理线程，职责是从 requestChannel 中的 requestQueue 取出 Request，处理以后再将 Response 添加到 requestChannel 中的 ResponseQueue 中。M 的大小由`num.io.threads` 参数决定；

  ![](https://img-blog.csdnimg.cn/img_convert/6abd4b98dff036ab57a70471186f63e9.png)

* 另外 Kafka 在后台还会有一些其他线程：
    * 定期清理数据的线程。
    * Controller 负责感知和管控整个集群的线程。
    * 副本同步拉取数据的线程。

我们可以通过以下方式修改最大可以使用的线程数。
```sh
#编辑配置文件 /etc/security/limits.conf  (永久生效)
* - nproc 4096

#命令行执行（当前会话生效）
ulimit -u 4096
```
### 4.3 进程可以使用的最大内存映射区域数
Kafka 之所以吞吐量高，其中的一个重要原因就是因为 Kafka 在 Consumer 读取日志文件时使用了 mmap 的方式。mmap 将磁盘文件映射到内存，支持读和写，对内存的操作会反映在磁盘文件上。当客户端读取 Kafka 日志文件时，在进行 log 文件读取的时候直接将 log 文件读入用户态进行缓存，绕过了内核态的 Page Cache，避免了内核态和用户态的切换。

我们可以通过以下方式修改进程可以使用的最大内存映射区域数。
```sh
#编辑配置文件 /etc/sysctl.conf  (永久生效)
vm.max_map_count=262144
编辑完文件后命令行执行 sysctl -p  立即永久生效

#命令行执行
sysctl -w vm.max_map_count=262144 (当前会话生效)
```

### 4.4 关闭 swap
Kafka 重度使用 Page Cache，如果内存页 swap 到磁盘中会严重影响到 Kafka 的性能。 使用以下命令永久关闭 swap。
```vim
swapoff -a && sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```
### 4.5 JVM 参数

虽然 Kafka 的服务器端代码是使用 Scala 编写的，但是最终还是编译成 Class 文件在 JVM 上允许，因此运行 Kafka 之前需要准备好 Java 运行环境。Kafka 自2.0.0版本开始，已经正式摒弃对 Java 7 的支持了，因此至少使用 Java 8。

进入 [Oracle 官网下载页面](https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html) 下载 JDK 8 压缩包。

编辑 /etc/profile 文件添加以下内容，设置 Java 环境变量，路径根据实际安装的位置修改。
```sh
export JAVA_HOME=/software/jdk
export PATH=$PATH:$JAVA_HOME/bin
```

编辑 /etc/profile 文件添加以下内容，设置 JVM 环境变量，在 Confluent 官网推荐了以下 GC 调优参数，该参数在 LinkedIn 的大型生产环境中得到过验证（基于 JDK 1.8 u5）。
```sh
#推荐的 GC 调优参数和 JVM 堆大小设置
export KAFKA_HEAP_OPTS="-Xms6g -Xmx6g -XX:MetaspaceSize=96m -XX:+UseG1GC -XX:MaxGCPauseMillis=20
       -XX:InitiatingHeapOccupancyPercent=35 -XX:G1HeapRegionSize=16M
       -XX:MinMetaspaceFreeRatio=50 -XX:MaxMetaspaceFreeRatio=80"

#后面会用到的环境变量，先提前设置了 
#Kafka 环境变量
export KAFKA_HOME=/usr/local/kafka
export PATH=$KAFKA_HOME/bin:$PATH

#JMX 端口，Kafka Eagle 监控会用到
export JMX_PORT="9999"
```

使环境变量生效。
```sh
source /etc/profile
```

以下是 LinkedIn 中的 Kafka 集群之一在高峰期的统计数据：
* 60 Brokers
* 50k Partitions (replication factor 2)
* 800k Messages/sec in
* 300 MBps inbound, 1 GBps + outbound

在该集群中所有的 Broker 中 90% 的 GC 暂停时间约为 21 毫秒，并且它们每秒执行的 Young GC 不到 1 次。

## 5 部署 Kafka 集群

### 5.1 机器规划

Zookeeper 节点和 Kafka 节点共用同一台物理机。

| IP 地址       | 角色           |
|-------------|--------------|
| 192.168.1.6 | Kafka Broker，Zookeeper，Kafka Eagle|
| 192.168.1.7 | Kafka Broker，Zookeeper |
| 192.168.1.8 | Kafka Broker，Zookeeper |

### 5.2 下载并解压安装包

本次 Kafka 搭建的版本是 2.7.1，下载地址可以在 [Kafka 官网下载页面](https://kafka.apache.org/downloads) 中找到。将下载好的安装包解压到 /usr/local/kafka 目录。

### 5.3 部署 Zookeeper

Kafka 官网提供的压缩包中包含了 Zookeeper 所需的文件，我们可以直接使用 Kafka 提供的文件来部署 Zookeeper。当然你可以单独下载 Zookeeper 的安装包来部署。

#### 5.3.1 创建相关目录
```sh
mkdir -p /usr/local/zk
```
#### 5.3.2 Zookeeper 配置文件

编辑 config/zookeeper.properties 文件，3 台 Zookeeper 节点的配置文件是相同的。
```sh
#ZooKeeper 使用的基本时间单位（毫秒），心跳超时时间是 tickTime 的两倍
tickTime=2000

#Leader 和 Follower 初始连接时最多能容忍的最多心跳数（2000 * 10 = 20s）
initLimit=10

#Leader 和 Follower 节点之间请求和应答之间能容忍的最多心跳数（2000 * 5 = 10s）
syncLimit=5

#数据目录
dataDir=/usr/local/zk

#监听客户端连接的端口
clientPort=2181

#最大客户端连接数
maxClientCnxns=60

#集群信息（服务器编号，服务器地址，Leader-Follower 通信端口，选举端口）
server.1=192.168.1.6:2888:3888
server.2=192.168.1.7:2888:3888
server.3=192.168.1.8:2888:3888

#不启动 jetty 管理页面服务
admin.enableServer=false

#允许所有四字指令
4lw.commands.whitelist=*
```

#### 5.3.3 设置节点 id

分别为 3 台 Zookeeper 节点设置不同的节点 id。
```sh
#节点 1
echo "1" > /usr/local/zk/myid

#节点 2
echo "2" > /usr/local/zk/myid

#节点 3
echo "3" > /usr/local/zk/myid
```

#### 5.3.4 启动 Zookeeper

在 3 台机器上分别使用以下命令启动 Zookeeper。
```sh
zookeeper-server-start.sh -daemon config/zookeeper.properties 
```

#### 5.3.5 查看 Zookeeper

使用 zookeeper-shell 连接 Zookeeper：

```sh
zookeeper-shell.sh 192.168.1.6:2181
```

然后使用以下命令可以看到注册到 Zookeeper 集群中的节点信息。
```sh
get  /zookeeper/config
server.1=192.168.1.6:2888:3888:participant
server.2=192.168.1.7:2888:3888:participant
server.3=192.168.1.8:2888:3888:participant
version=0
```

### 5.4 部署 Kafka
#### 5.4.1 Kafka 配置文件

编辑 config/server.propertie 文件，每台 Kafka 节点除了以下配置以外，其余配置相同：
* broker.id：每个 Broker 的 id 必须唯一，分别设置为 0，1，2。
* listeners：Kafka Broker 监听地址和端口。

有以下几个参数需要注意：
* 连接相关参数：
    * `listeners`：Kafka Broker 监听地址和端口。
    * `zookeeper.connect`：Zookeeper 连接信息。
* 请求处理相关参数：
    * `num.network.threads`：Broker 用于处理网络请求的线程数，默认值 3。
    * `num.io.threads`：Broker 用于处理 I/O 的线程数，推荐值 8 * 磁盘数，默认值 8.
    * `queued.max.requests`：在网络线程停止读取新请求之前，可以排队等待 I/O 线程处理的最大请求个数，默认值 500。增大`queued.max.requests` 能够缓存更多的请求。
* `log.dirs`：数据存放目录，我们在每台机器上使用 15 块硬盘，每块硬盘单独挂载一个目录。
* Topic 相关参数：
    * `num.partitions` Topic 的默认分区数。
    * `default.replication.factor` Topic 中每个分区的默认副本数。
* 数据保留相关参数：
    * `log.retention.hours`：最多保留多少小时的数据。
    * `log.retention.bytes`：最多保留多少字节的数据。

```sh
############################# Server Basics #############################
#broker 的 id,必须唯一
broker.id=0

############################# Socket Server Settings #############################
#监听地址
listeners=PLAINTEXT://192.168.1.6:9092

#Broker 用于处理网络请求的线程数
num.network.threads=6

#Broker 用于处理 I/O 的线程数，推荐值 8 * 磁盘数
num.io.threads=120

#在网络线程停止读取新请求之前，可以排队等待 I/O 线程处理的最大请求个数
queued.max.requests=1000

#socket 发送缓冲区大小
socket.send.buffer.bytes=102400

#socket 接收缓冲区大小
socket.receive.buffer.bytes=102400

#socket 接收请求的最大值（防止 OOM）
socket.request.max.bytes=104857600


############################# Log Basics #############################

#数据目录
log.dirs=/data1,/data2,/data3,/data4,/data5,/data6,/data7,/data8,/data9,/data10,/data11,/data12,/data13,/data14,/data15

#清理过期数据线程数
num.recovery.threads.per.data.dir=3

#单条消息最大 10 M
message.max.bytes=10485760

############################# Topic Settings #############################

#不允许自动创建 Topic
auto.create.topics.enable=false

#不允许 Unclean Leader 选举。
unclean.leader.election.enable=false

#不允许定期进行 Leader 选举。
auto.leader.rebalance.enable=false

#默认分区数
num.partitions=3

#默认分区副本数
default.replication.factor=3

#当生产者将 acks 设置为 "all"（或"-1"）时，此配置指定必须确认写入的副本的最小数量，才能认为写入成功
min.insync.replicas=2

#允许删除主题
delete.topic.enable=true

############################# Log Flush Policy #############################

#建议由操作系统使用默认设置执行后台刷新
#日志落盘消息条数阈值
#log.flush.interval.messages=10000
#日志落盘时间间隔
#log.flush.interval.ms=1000
#检查是否达到flush条件间隔
#log.flush.scheduler.interval.ms=200

############################# Log Retention Policy #############################

#日志留存时间 7 天
log.retention.hours=168

#最多存储 58TB 数据
log.retention.bytes=63771674411008
                    
#日志文件中每个 segment 的大小为 1G
log.segment.bytes=1073741824

#检查 segment 文件大小的周期 5 分钟
log.retention.check.interval.ms=300000

#开启日志压缩
log.cleaner.enable=true

#日志压缩线程数
log.cleaner.threads=8

############################# Zookeeper #############################

#Zookeeper 连接参数
zookeeper.connect=192.168.1.6:2181,192.168.1.7:2181,192.168.1.8:2181

#连接 Zookeeper 的超时时间
zookeeper.connection.timeout.ms=6000


############################# Group Coordinator Settings #############################

#为了缩短多消费者首次平衡的时间，这段延时期间 10s 内允许更多的消费者加入组
group.initial.rebalance.delay.ms=10000

#心跳超时时间默认 10s，设置成 6s 主要是为了让 Coordinator 能够更快地定位已经挂掉的 Consumer
session.timeout.ms = 6s。

#心跳间隔时间，session.timeout.ms >= 3 * heartbeat.interval.ms。
heartbeat.interval.ms=2s

#最长消费时间 5 分钟
max.poll.interval.ms=300000
```

#### 5.4.2 启动 Kafka

使用以下命令在后台启动 Kafka。
```sh
kafka-server-start.sh -daemon config/server.properties
```

#### 5.4.3 查看 Kafka 集群
```sh
#连接 Zookeeper
zookeeper-shell.sh  127.0.0.1:2181

#查看 Kafka 节点
ls /brokers/ids
[0, 1, 2]

#查看 Kafka Controller
get /controller
{"version":1,"brokerid":0,"timestamp":"1631005545929"}
```

## 6 部署 Kafka Eagle 可视化工具（可选）

Kafka Eagle 是一款 Kafka 可视化和管理软件，支持对多个不同版本的 Kafka 集群进行管理。Kafka Eagle 可以监控 Kafka 集群的健康状态，消费者组的消费情况，创建和删除 Topic，支持使用 KSQL 对 Kafka 消息做 Ad-hoc 查询，支持多种告警方式等等。

![](https://img-blog.csdnimg.cn/img_convert/a8e2b58b29ffec0f1642f4b1a85ac799.png)

### 6.1 下载并解压安装包
在 [Kafka Eagle 官网下载页面](http://download.kafka-eagle.org/) 下载压缩包，将压缩包解压到 /usr/local/kafka-eagle 目录。

### 6.2 设置环境变量

编辑 /etc/profile 文件设置环境变量：
```sh
export KE_HOME=/usr/local/kafka-eagle/kafka-eagle-web-2.0.6
export PATH=$PATH:$KE_HOME/bin
```
### 6.3 Kafka Eagle 配置
编辑 conf/system-config.properties 配置文件：
```yaml
######################################
# Kafka 集群列表
######################################
kafka.eagle.zk.cluster.alias=cluster1
cluster1.zk.list=192.168.1.6:2181,192.168.1.7:2181,192.168.1.8:2181

######################################
# Zookeeper 线程池最大连接数
######################################
kafka.zk.limit.size=32

######################################
# Kafka Eagle 的页面访问端口
######################################
kafka.eagle.webui.port=8048

######################################
# 存储消费信息的类型，在 0.9 版本之前，消费
# 信息会默认存储在 Zookeeper 中，存储类型
# 设置 Zookeeper 即可；如果是在 0.10 版本之后，
# 消费者信息默认存储在 Kafka 中，存储类型
# 设置为 kafka。
######################################
cluster1.kafka.eagle.offset.storage=kafka

######################################
# Kafka JMX 指标监控，Kafka 需要开启 JMX
######################################
cluster1.kafka.eagle.jmx.uri=service:jmx:rmi:///jndi/rmi://%s/jmxrmi

######################################
# 开启性能监控，数据默认保留 30 天
######################################
kafka.eagle.metrics.charts=true
kafka.eagle.metrics.retain=15

######################################
# kafka sql topic records max
######################################
kafka.eagle.sql.topic.records.max=5000
kafka.eagle.sql.topic.preview.records.max=10

######################################
#  删除 Kafka Topic 时需要输入的密钥
######################################
kafka.eagle.topic.token=keadmin

######################################
# 存储 Kafka Eagle 元数据信息的数据库
# 目前支持 MySQL 和 Sqlite，默认使用 Sqlite 进行存储
######################################
kafka.eagle.driver=org.sqlite.JDBC
kafka.eagle.url=jdbc:sqlite:/usr/local/kafka-eagle/kafka-eagle-web-2.0.6/db/ke.db
kafka.eagle.username=root
kafka.eagle.password=123456
```

### 6.4 启动 Kafka Eagle

使用以下命令启动 Kafka Eagle：
```sh
bin/ke.sh start
```
看到以下输出，表示 Kafka Eagle 启动成功。
```sh
......
Welcome to
    __ __    ___     ____    __ __    ___            ______    ___    ______    __     ______
   / //_/   /   |   / __/   / //_/   /   |          / ____/   /   |  / ____/   / /    / ____/
  / ,<     / /| |  / /_    / ,<     / /| |         / __/     / /| | / / __    / /    / __/   
 / /| |   / ___ | / __/   / /| |   / ___ |        / /___    / ___ |/ /_/ /   / /___ / /___   
/_/ |_|  /_/  |_|/_/     /_/ |_|  /_/  |_|       /_____/   /_/  |_|\____/   /_____//_____/   
                                                                                             

Version 2.0.6 -- Copyright 2016-2021
*******************************************************************
* Kafka Eagle Service has started success.
* Welcome, Now you can visit 'http://192.168.1.6:8048'
* Account:admin ,Password:123456
*******************************************************************
* <Usage> ke.sh [start|status|stop|restart|stats] </Usage>
* <Usage> https://www.kafka-eagle.org/ </Usage>
*******************************************************************
```

在浏览器输入 http://192.168.1.6:8048 访问 Kafka Eagle 页面，用户名 admin，密码 123456。我们查看 Kafka 集群的节点状态。

![](https://img-blog.csdnimg.cn/img_convert/58f321454304b7726247ac37cd35d70f.png)

也可以在 Kafka Eagle 页面上管理 Topic。

![](https://img-blog.csdnimg.cn/img_convert/8c22564313a1f6a2c7afd93ff1bf67ae.png)

## 参考资料
* [Confluent 官网 Running Kafka in Production](https://docs.confluent.io/platform/current/kafka/deployment.html)
* [Kafka(4)-kafka生产环境规划部署](https://segmentfault.com/a/1190000039723251)
* [2万长文，一文搞懂Kafka](https://mp.weixin.qq.com/s/cU6fkgQH4ErTP-lKiVotrA)
* [Linux Page Cache调优在Kafka中的应用](https://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247487568&idx=1&sn=fcd54d366b4e6ca049c43a3ce9d32ce4&scene=21#wechat_redirect)
* [聊聊 page cache 与 Kafka 之间的事儿](https://mp.weixin.qq.com/s/_1mnDFITm11AzMKXqmqFzg)
* [Kafka线上集群部署方案怎么做？](https://time.geekbang.org/column/article/101107)
* [最最最重要的集群参数配置（上）](https://time.geekbang.org/column/article/101171)
* [最最最重要的集群参数配置（下）](https://time.geekbang.org/column/article/101763)
* [Kafka原理：kafka之mmap文件读写方式](https://blog.csdn.net/daijiguo/article/details/104871390)
* [Apache Kafka 集群部署指南](https://mp.weixin.qq.com/s/IiPeTZf6wd5OLqSJ5dySJQ)
* [图解Kafka的零拷贝技术到底有多牛？](https://cloud.tencent.com/developer/article/1421266)
* [终于知道 Kafka 为什么这么快了！](https://xie.infoq.cn/article/c06fea629926e2b6a8073e2f0)
* [深入了解Kafka【一】概述与基础架构](https://segmentfault.com/a/1190000021175583)
* [Kafka2.8安装](https://www.cnblogs.com/smartloli/p/14722529.html)
* [Apache Kafka 3.0 版本发布](https://blog.csdn.net/zhongqi2513/article/details/120429015)
* [Kafka 性能优化与问题深究](https://blog.csdn.net/qq_41324009/article/details/100584223)
