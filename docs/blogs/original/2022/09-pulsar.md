---
title: Pulsar 介绍与部署
author: Se7en
date: 2022/02/03 20:00
categories:
- 原创
tags:
- Pulsar
---

# Pulsar 介绍与部署

Apache Pulsar 是灵活的发布-订阅消息系统（Flexible Pub/Sub messaging），采用计算与存储分离的架构。雅虎在 2013 年开始开发 Pulsar ，于 2016 年首次开源，目前是 Apache 软件基金会的顶级项目。Pulsar 具有支持多租户、持久化存储、多机房跨区域数据复制、高吞吐、低延迟等特性。

## Pulsar 组件

Pulsar 集群主要由以下三部分组成：
* **Broker**：Pulsar 的 broker 是一个无状态组件，本身不存储数据。主要负责处理 producer 和 consumer 的请求，消息的复制与分发，数据的计算。
* **Zookeeper**：主要用于存储元数据、集群配置，任务的协调（例如哪个 broker 负责哪个 topic），服务的发现（例如 broker 发现 bookie 的地址）。
* **Bookkeeper**：主要用于数据的持久化存储。除了消息数据，cursors 也会被持久化到 Bookkeeper，cursors 是消费端订阅消费的位移。 Bookkeeper 中每一个存储节点叫做 bookie。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210518235843.png)

## Pulsar 基本概念
### Producer & Consumer

身为⼀个 Pub/Sub 系统，⾸先的存在要素必然是 producer（⽣产者）。producer 发送数据给 Pulsar，将消息以 append 的形式追加到 topic 中。发送的数据是 key/value 形式的，并且数据会上 schema 的信息。Pulsar 会确保⼀个 producer 往 topic 发送的消息满⾜⼀定的 schema 格式。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519160102.png)

既然有 producer 负责生产消息，那么相应地就有 consumer 负责消费消息。在 Pulsar 中 consumer 可以使用不同的订阅模式来接受消息。

### Subscription

Pulsar ⾥将 consumer 接收消息的过程称之为：subscription（订阅），类似于 Kafka 的 consumer group（消费组）。⼀个订阅⾥的所有 consumer，会作为⼀个整体去消费这个 topic ⾥的所有消息。Pulsar 有四种订阅模式：独占（exclusive）、故障转移（failover）、共享（shared）、共享键（key_shared）。

#### Exclusive

在 exclusive 模式下，一个 subscription 只允许被一个 consumer 用于订阅 topic ，如果多个 consumer 使用相同的 subscription 去订阅同一个 topic，则会发生错误。exclusive 是默认的订阅模式。如下图所示，Consumer A-0 和 Consumer A-1 都使用了相同的 subscription（相同的消费组），只有 Consumer A-0 被允许消费消息。
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519212224.png)

#### Failover

在 failover 模式下，多个 consumer 允许使用同一个 subscription 去订阅 topic。但是对于给定的 topic，broker 将选择⼀个 consumer 作为该 topic 的主 consumer ，其他 consumer 将被指定为故障转移 consumer 。当主 consumer 失去连接时，topic 将被重新分配给其中⼀个故障转移 consumer ，⽽新分配的 consumer 将成为新的主 consumer 。发⽣这种情况时，所有未确认的消息都将传递给新的主 consumer ，这个过程类似于 Kafka 中的 consumer 组重平衡（rebalance）。

如下图所示，Consumer B-0 是 topic 的主 consumer ，当 Consumer B-0 失去连接时，Consumer B-1 才能成为新的主 consumer 去消费 topic。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519214440.png)


#### Shared

在 shared 模式下，多个 consumer 可以使用同一个 subscription 去订阅 topic。消息以轮询的方式分发给 consumer ，并且每条消费仅发送给一个 consumer 。当有 consumer 失去连接时，所有发送给该 consumer 但未被确认的消息将被重新安排，以便发送给该 subscription 上剩余的 consumer 。

如下图所示，Consumer C-1，Consumer C-2，Consumer C-3 以轮询的方式接受消息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519214921.png)

shared 模式有以下限制：
* 消息不能保证有序。
* 不支持批量 ack。


#### Key_Shared

key_shared 是 Pulsar 2.4.0 以后⼀个新订阅模式。在 shared 模式下，多个 consumer 可以使用同一个 subscription 去订阅 topic。消息按照 key 分发给 consumer ，含有相同 key 的消息只被发送给同一个 consumer 。

如下图所示，不同的 consumer 只接受到对应 key 的消息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519215046.png)

key_shared 模式有以下限制：
* 需要为每条消息指定一个 key 或者 orderingKey。
* 不支持批量 ack。
*  producer 应该禁用 batch 或者使用基于 key 的 batch。

### Cursor

cursor 是用来存储一个 subscription 中消费的状态信息（类似 Kafka 中的 offset，偏移量）。Pulsar 将 subscription 的 cursor 存储至 BookKeeper 的 ledger 中。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519223522.png)


### 存储模型
* 第一层抽象是 topic（partition），topic 是一个逻辑的概念，topic 是消息的集合，所有⽣产者的消息，都会归属到指定的 topic ⾥。所有在 topic ⾥的消息，会按照⼀定的规则，被切分成不同的分区（partition）。在 Kafka 中 partition 是真正的物理单元，但是在 Pulsar 中 partition 仍然是一个逻辑的概念。
* Pulsar 把 partition 进一步分成多个分片（segment），segment 是 Pulsar 中真正的物理单元，Pulsar 中的数据是持久化在 Bookkeeper 中的，segment 其实对应的就是 Bookkeeper 中的 ledger。
* 在分片中存储了更小粒度的 entry，entry 存储的是一条或者一个 batch 的消息，batch 是一次性批量提交多条消息。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519224042.png)

⽽最底层的 message 通常包含 Message ID，由以下几个部分组成：
* partition-index
* ledger-id（segment）
* entry-id
* batch-index

### Broker

Pulsar 中的 broker 是无状态的，不存储数据，真正的数据存储在 Bookkeeper 上。每个 topic 的 partition 都会分配到某一个 borker 上，producer 和 consumer 则会连接到这个 broker，从而向该 topic 的 partition 发送和消费消息。broker 主要负责消息的复制与分发，数据的计算。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519161252.png)

### Namespace & Tenant

Pulsar 从一开始就支持多租户，topic 的名称是层级化的，最上层是租户（tenant），然后是命名空间（namespace），最后才是 topic。

```sh
{persistent|non-persistent}://tenant/namespace/topic
```

* 租户可以跨集群分布，每个租户都可以有单独的认证和授权机制。 租户也是存储配额、消息 TTL 和隔离策略的管理单元。
* 命名空间是租户的管理单元，命名空间上配置的策略适用于在该命名空间中创建的所有 topic。 租户可以使用 REST API 和 pulsar-admin CLI 工具来创建多个命名空间。
* `persistent|non-persistent` 标识了 topic 的类型，默认情况下 topic 是持久化存储到磁盘上的。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519210253.png)

### Ack 机制
在 Pulsar 中支持了两种 ack 的机制，分别是单条 ack 和批量 ack。单条 ack（AckIndividual）是指 consumer 可以根据消息的 messageID 来针对某一个特定的消息进行 ack 操作；批量 ack（AckCumulative）是指一次 ack 多条消息。

### 消息生命周期

默认情况下，Pulsar Broker 会对消息做如下处理：
* 当消息被 consumer 确认之后，会立即执行删除操作。
* 对于未被确认的消息会存储到 backlog 中。

但是，很多线上的生产环境下，这种默认行为并不能满足我们的生产需求，所以，Pulsar 提供了如下配置策略来覆盖这些行为：
* Retention 策略：用户可以将 consumer 已经确认的消息保留下来。
* TTL 策略：对于未确认的消息，用户可以通过设置 TTL 来使未确认的消息到达已经确认的状态。

上述两种策略的设置都是在 NameSpace 的级别进行设置。

#### Backlog

backlog 是未被确认的消息的集合，它有一个大前提是，这些消息所在的 topic 是被 broker 所持久化的，在默认情况下，用户创建的 topic 都会被持久化。换句话说，broker 会将所有未确认或者未处理的消息都存放到 backlog 中。

需要注意的是，对 backlog 进行配置时，我们需要明确以下两点：
* 在当前的 namespace 下，每一个 topic 允许 backlog 的大小是多少。
* 如果超过设定的 backlog 的阈值，将会执行哪些操作。

当超过设定的 backlog 的阈值，Pulsar 提供了以下三种策略供用户选择：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519233202.png)

#### Retention

Retention 策略的设置提供了两种方式：
* 消息的大小，默认值：defaultRetentionSizeInMB=0
* 消息被保存的时间，默认值：defaultRetentionTimeInMinutes=0

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519232953.png)

#### Time To Live（TTL）

TTL 参数就像附在每条消息上的秒表，用于定义允许消息停留在未确认状态的时间。当 TTL 过期时，Pulsar 会自动将消息更改为已确认状态（并使其准备删除）。TTL 只去处理一件事情，就是将未被确认的消息变为被确认的状态，TTL 本身不会去涉及相应的删除操作。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519232401.png)

### 消息写入流程

producer 向 topic 的 partition 对应的 broker 发送消息。broker 以并行的方式将消息写到多个 bookie 中，当指定数量的 bookie 写入成功时，broker 会向 producer 响应消息写入成功。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519000205.png)




### 消息读取流程

consumer 向订阅 topic 的 partition 对应的 broker 请求消息，如果消息在 broker 的缓存中存在，则 broker 直接将消息返回给 consumer 。如果缓存中不存在，broker 去 bookie 中读取消息，然后返回给 consumer 。 consumer 在完成消费后，向 broker 响应 ack 表示完成消费。  consumer  ack 的元数据也是会持久化在 bookie 中的。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519000313.png)





## Pulsar vs Kafka

### 数据存储

* Kafka 的服务层和存储层位于同一节点上，broker 负责数据的计算与存储。
* Pulsar 的架构将服务层与存储层解耦：无状态 broker 节点负责数据服务；bookie 节点负责数据存储。
* 另外 Pulsar 还支持分层存储，如主存储（基于 SSD）、历史存储（S3）等。可以将访问频率较低的数据卸载到低成本的持久化存储（如 AWS S3、Azure 云）中。

### 存储单元

* Kafka 和 Pulsar 都有类似的消息概念，客户端通过主题与消息系统进行交互，每个主题都可以分为多个分区。 Pulsar 和 Kafka 之间的根本区别在于 Kafka 是以分区（partition）作为数据的存储单元，而 Pulsar 是以分片（segment）作为为数据的存储单元。
* 在 Kafka 中，分区只能存储在单个节点上并复制到其他节点，其容量受最小节点容量的限制。当对集群进行扩容时或者发送副本故障时，会触发数据的拷贝，这将耗费很长的时间。
*  在 Pulsar 中，同样是以分区作为为逻辑单元，但是是以 segment 为物理存储单元。分区随着时间的推移会进行分段，并在整个集群中均衡分布，能够有效迅速地扩展。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210519135832.png)

### 名词对应表
根据个人对 Pulsar 和 Kafka 的理解，整理如下 Pulsar 和 Kafka 的名词对应表：

| Pulsar                 | Kafka                 |
|------------------------|-----------------------|
| Topic                  | Topic                 |
| Partition              | Partition             |
| Segment（Ledger）       | Segment               |
| Bookie                 | Broker                |
| Broker                 | Client SDK            |
| Ensemble Size          | metadata.broker.list  |
| Write Quorum Size (Qw) | Replica Number        |
| Ack Quorum Size (Qa)   | request.required.acks |

* Pulsar 和 Kafka 都是以 topic 描述一个基本的数据集合，topic 数据又逻辑分为若干个 partition。
* 但 Kafka 以 partition 作为物理存储单位，每个 partition 必须作为一个整体（一个目录）存储在某一个 broker 上，虽然 Kafka 也会将一个 partition 分成多个 segment，但是这些 segment 是存在 Kafka broker 的同一个目录下。而 Pulsar 的每个 partition 是以 segment（对应到 Bookkeeper 的 ledger） 作为物理存储的单位，所以 Pulsar 中的一个逻辑上有序的 partition 数据集合在物理上会均匀分散到多个 bookie 节点中。
* Pulsar 的数据存储节点 Bookkeeper 被称为 bookie，相当于一个 Kafka broker。
* ensemble size 表示 topic 要用到的物理存储节点 bookie 个数，其副本数目 Qw 不能超过 bookie 个数，因为一个 bookie 上不能存储超过一个以上的数据副本。
* Qa 是每次写请求发送完毕后需要回复确认的 bookie 的个数。

## Pulsar 部署

部署 Pulsar 集群包括以下步骤(按顺序)：
* 1.部署一个 ZooKeeper 集群，初始化 Pulsar 集群元数据。
* 2.部署一个 Bookkeeper 集群。
* 3.部署一个或多个 Pulsar brokers。
* 4.部署 Pulsar manager（可选）。

## 节点规划

| 主机名        | IP地址          |角色|端口号|
|------------|---------------|---------------|---------------|
| zookeeper1 | 192.168.1.191 |zookeeper|2181|
| zookeeper2 | 192.168.1.192 |zookeeper|2181|
| zookeeper3 | 192.168.1.193 |zookeeper|2181|
| Bookkeeper1 | 192.168.1.194 |Bookkeeper|3181|
| Bookkeeper2 | 192.168.1.195 |Bookkeeper|3181|
| Bookkeeper3 | 192.168.1.196 |Bookkeeper|3181|
| pulsar1    | 192.168.1.147 |broker|8080（http协议），6650（pulsar协议）|
| pulsar2    | 192.168.1.148 |broker|8080（http协议），6650（pulsar协议）|
| pulsar3    | 192.168.1.149 |broker|8080（http协议），6650（pulsar协议）|
| pulsar1    | 192.168.1.149 |pulsar-manager |7750|


## 下载二进制包
下载 pulsar 发行版的二进制的包，里面包含了 zookeeper，Bookkeeper，pulsar 所需要的文件：
```sh
wget https://archive.apache.org/dist/pulsar/pulsar-2.7.1/apache-pulsar-2.7.1-bin.tar.gz
```
包下载完成后，解压并进入到解压后的目录：
```sh
tar xvzf apache-pulsar-2.7.1-bin.tar.gz
cd apache-pulsar-2.7.1
```
解压后的文件目录包含以下子目录：

| 目录   | 内容                                    |
|------|---------------------------------------|
| bin  | Pulsar 命令行工具，比如 pulsar 和 pulsar-admin |
| conf | 配置文件，包含ZooKeeper，Bookkeeper，Pulsar 等等  |
| data | Zookeeper 和 Bookkeeper 保存数据的目录         |
| lib  | Pulsar 使用的 JAR 文件                     |
| logs | 日志目录                                  |

## 部署 Zookeeper 集群
### 修改 Zookeeper 配置文件
修改所有 Zookeeper 节点的 conf/zookeeper.conf 配置文件：

```sh
# 设置Zookeeper数据存放目录。
dataDir=data/zookeeper

# 在配置文件中为每个节点添加一个 server.N行，其中N是ZooKeeper节点的编号。
server.1=192.168.1.191:2888:3888
server.2=192.168.1.192:2888:3888
server.3=192.168.1.193:2888:3888
```

在每个 Zookeeper 节点的 myid 文件中配置该节点在集群中的唯一ID。 myid 文件应放在 dataDir 指定的目录下：

```sh
# 创建目录
mkdir -p data/zookeeper
# 每个Zookeeper节点的ID号不能重复，并且和server.N的编号对应，依次为1，2，3
echo 1 > data/zookeeper/myid
```
### 启动 Zookeeper 集群
在每台 Zookeeper 节点启动 Zookeeper 服务：

```sh
bin/pulsar-daemon start zookeeper
```
### 初始化集群元数据
Zookeeper 集群启动成功后，需要将一些 Pulsar 集群的元信息写入 ZooKeeper 集群的每个节点，由于数据在 ZooKeeper 集群内部会互相同步，因此只需要将元信息写入 ZooKeeper 的一个节点即可：

```sh
bin/pulsar initialize-cluster-metadata \
  --cluster pulsar-cluster-1 \
  --zookeeper 192.168.1.191:2181 \
  --configuration-store 192.168.1.191:2181 \
  --web-service-url http://192.168.1.147:8080,192.168.1.148:8080,192.168.1.149:8080 \
  --broker-service-url pulsar://192.168.1.147:6650,192.168.1.148:6650,192.168.1.149:6650
```

参数说明如下：

| 参数                    | 说明                                                    |
|-----------------------|-------------------------------------------------------|
| —cluster              | pulsar 集群名字                                           |
| --zookeeper           | zookeeper 地址，只需要包含 zookeeer 集群中的任意一台机器即可              |
| --configuration-store | 配置存储地址，只需要包含 zookeeer 集群中的任意一台机器即可                    |
| --web-service-url     | pulsar 集群 web 服务的 URL 以及端口，默认的端口是8080                 |
| --broker-service-url  | broker 服务的URL，用于与 pulsar 集群中的 brokers 进行交互，默认端口是 6650 |

## 部署 Bookkeeper 集群
Pulsar 集群中所有持久数据的存储都由 Bookkeeper 负责。
### 修改 Bookkeeper 配置文件
修改所有 Bookkeeper 节点的 conf/Bookkeeper.conf 配置文件，设置 Bookkeeper 集群连接的 Zookeeper 信息：

```sh
zkServers=192.168.1.191:2181,192.168.1.192:2181,192.168.1.193:2181
```
### 启动 Bookkeeper 集群

在每台 Bookkeeper 节点启动 Bookkeeper 服务：
```sh
bin/pulsar-daemon start bookie
```

### 验证 Bookkeeper 集群状态
在任意一台 Bookkeeper 节点上使用 Bookkeeper shell 的 simpletest 命令，去校验集群内所有的 bookie 是否都已经启动，3 为 Bookkeeper 节点数量。
```sh
bin/bookkeeper shell simpletest --ensemble 3 --writeQuorum 3 --ackQuorum 3 --numEntries 3
```
参数含义如下：

```sh
-a,--ackQuorum <arg>     Ack quorum size (default 2)  当指定数量的 bookie ack 响应时，认为消息写入成功
-e,--ensemble <arg>      Ensemble size (default 3)  写入数据的 bookie 节点数量
-n,--numEntries <arg>    Entries to write (default 1000) 一批消息的消息数量
-w,--writeQuorum <arg>   Write quorum size (default 2) 每条消息副本数量
```

这个命令会在集群上创建和 bookie 同等数量的 ledger，并往里面写一些条目，然后读取它，最后删除这个 ledger。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210430225005.png)

## 部署 Pulsar 集群
### 修改 Pulsar 配置文件
修改所有 Pulsar 节点的 conf/broker.conf 配置文件：

```sh
# 配置pulsar broker连接的zookeeper集群地址
zookeeperServers=192.168.1.191:2181,192.168.1.192:2181,192.168.1.193:2181
configurationStoreServers=192.168.1.191:2181,192.168.1.192:2181,192.168.1.193:2181

# broker数据端口
brokerServicePort=6650

# broker web服务端口
webServicePort=8080

# pulsar 集群名字，和前面zookeeper初始化集群元数据时配置的一样
clusterName=pulsar-cluster-1

# 创建一个ledger时使用的bookie数量
managedLedgerDefaultEnsembleSize=2

# 每个消息的副本数量
managedLedgerDefaultWriteQuorum=2

# 完成写操作前等待副本ack的数量
managedLedgerDefaultAckQuorum=2
```
### 启动 Pulsar 集群

在每台 Pulsar 节点启动 broker：

```sh
bin/pulsar-daemon start broker
```
## 客户端连接 Pulsar 集群
### 修改客户端配置文件

修改 conf/client.conf 文件。

```sh
# pulsar集群web服务url
webServiceUrl=http://192.168.1.147:8080,192.168.1.148:8080,192.168.1.149:8080

# pulsar服务端口
# URL for Pulsar Binary Protocol (for produce and consume operations)
brokerServiceUrl=pulsar://192.168.1.147:6650,192.168.1.148:6650,192.168.1.149:6650
```
### 客户端生产和消费消息
consumer 使用如下命令订阅 pulsar-test 这个主题的消息：
* -n：订阅消息的数量
* -s：订阅组名
* -t：订阅类型，有以下值Exclusive, Shared, Failover, Key_Shared

```sh
bin/pulsar-client consume \
  persistent://public/default/pulsar-test \
  -n 100 \
  -s "consumer-test" \
  -t "Exclusive"
```

如果不指定 `--url` 参数并且没有在 `conf/client.conf` 文件中指定 pulsar 集群连接信息，则默认连接的是 `pulsar://localhost:6650/`。可以指定 `--url pulsar://192.168.1.147:6650` 或者 `--url http://192.168.1.147:8080` 与 broker 进行交互。

新开一个终端， producer 使用如下命令向 pulsar-test 主题生产一条消息，消息内容为 "Hello Pulsar"：
* -n：生产消息的数量
* -m：消息内容

```sh
bin/pulsar-client produce \
  persistent://public/default/pulsar-test \
  -n 1 \
  -m "Hello Pulsar"
```

在 consumer 终端可以看到成功消费到了消息：

```
23:20:47.418 [pulsar-client-io-1-1] INFO  com.scurrilous.circe.checksum.Crc32cIntChecksum - SSE4.2 CRC32C provider initialized
----- got message -----
key:[null], properties:[], content:Hello Pulsar
```

## 部署 Pulsar manager
Pulsar manager 是用于管理和监控 Pulsar 集群的 WebUI 工具。Pulsar manager 可以管理多个 Pulsar 集群。
github 地址：https://github.com/apache/pulsar-manager

### 安装 Pulsar manager

```sh
wget https://dist.apache.org/repos/dist/release/pulsar/pulsar-manager/pulsar-manager-0.2.0/apache-pulsar-manager-0.2.0-bin.tar.gz
tar -zxvf apache-pulsar-manager-0.2.0-bin.tar.gz
cd pulsar-manager
tar -xvf pulsar-manager.tar
cd pulsar-manager
cp -r ../dist ui
./bin/pulsar-manager
``` 

### 创建 Pulsar manager 账号

创建用户名为 admin，密码为 apachepulsar 的超级管理员账号：

```sh
CSRF_TOKEN=$(curl http://192.168.1.147:7750/pulsar-manager/csrf-token)
curl \
    -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
    -H "Cookie: XSRF-TOKEN=$CSRF_TOKEN;" \
    -H 'Content-Type: application/json' \
    -X PUT http://192.168.1.147:7750/pulsar-manager/users/superuser \
    -d '{"name": "admin", "password": "apachepulsar", "description": "myuser", "email": "chengzw258@163.com"}'
```
### Pulsar manager 界面

访问 http://192.168.1.147:7750/ui/index.html 登录 Pulsar manager：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210512095328.png)

点击 New Environment 添加 Pulsar 集群：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210501104203.png)


添加完成后可以查看并设置 Pulsar 集群的相关信息，例如查看 topic 信息：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210512095544.png)


访问 http://192.168.1.147:7750/bkvm 查看 bookie 信息，用户名：admin，密码：admin。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210518224242.png)

查看 ledger 信息：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210518224258.png)


## Perf 压力测试

pulsar 提供了压力测试的命令行工具，使用以下命令生产消息：
* -r：每秒生产的消息总数（所有生产者）
* -n：生产者数量
* -s：每条消息的大小（bytes）
* 最后跟上 topic 名字

```sh
bin/pulsar-perf produce -r 100 -n 2 -s 1024 test-perf

# 输出内容，从左到右依次是：
# 每秒生产的消息数量：87.2条
# 每秒流量大小：0.7Mb
# 每秒生产失败的消息数：0
# 平均延迟：5.478ms
# 延迟中位数：4.462ms
# 95%的延迟在 11.262ms以内
# 99%的延迟在 25.802ms以内
# 99.9%的延迟在 43.757ms以内
# 99.99%的延迟在 51.956ms以内
# 最大延迟：51.956ms

... Throughput produced:   87.2  msg/s ---      0.7 Mbit/s --- failure      0.0 msg/s --- Latency: mean:   5.478 ms - med:   4.642 - 95pct:  11.263 - 99pct:  25.802 - 99.9pct:  43.757 - 99.99pct:  51.956 - Max:  51.956
```

使用以下命令消费消息：

```sh
bin/pulsar-perf consume test-perf

# 输出内容，从左到右依次是：
# 每秒消费的消息数量：100.007条
# 每秒流量大小：0.781Mb
# 平均延迟：9.273ms
# 延迟中位数：9ms
# 95%的延迟在 14ms以内
# 99%的延迟在 15ms以内
# 99.9%的延迟在 28ms以内
# 99.99%的延迟在 34ms以内
# 最大延迟：34ms
... Throughput received: 100.007  msg/s -- 0.781 Mbit/s --- Latency: mean: 9.273 ms - med: 9 - 95pct: 14 - 99pct: 15 - 99.9pct: 28 - 99.99pct: 34 - Max: 34
```

在 Pulsar manager 界面可以 test-perf 这个 topic 有两个生产者在生产消息，有一个消费者正在消费消息：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210518225656.png)

查看 topic 的 存储状况：

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20210518225919.png)




## 参考链接
* https://livebook.manning.com/book/pulsar-in-action/chapter-1/v-8/1
* https://pulsar.apache.org/en/
* https://www.jianshu.com/p/4664de047c71
* https://mp.weixin.qq.com/s?__biz=MzUyMjkzMjA1Ng==&mid=2247487414&idx=1&sn=850ec2ccc4d2847066a98a899bd0ce1f&chksm=f9c51581ceb29c973a87c2548c45755225198ecfa2b235abec61623adfcc70c3d381be8cf501&scene=21#wechat_redirect
* https://alexstocks.github.io/html/pulsar.html
* https://tech.meituan.com/2015/01/13/kafka-fs-design-theory.html
