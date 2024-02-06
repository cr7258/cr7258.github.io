---
title: 如何往 Kafka 发送大消息？
author: Se7en
date: 2022/05/04 20:00
categories:
 - 原创
tags:
 - Kafka
---

# 如何往 Kafka 发送大消息？

默认情况下，Kafka topic 中每条消息的默认限制为 1MB。这是因为在 Kafka 中，非常大的消息被认为是低效和反模式的。然而，有时候你可能需要往 Kafka 中发送大消息。在本文中我们将研究在 Kafka 中处理大消息的两种方法。

## 选项 1：使用外部存储

将大消息（例如视频文件）发送到外部存储，在 Kafka 中只保存这些文件的引用，例如文件的 URL。外部存储可以是云存储（例如 Amazon S3），也可以是网络存储（NAS）或者 HDFS 等本地大型文件存储系统。

![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220617214405.png)

## 选项 2：修改 Kafka 消息大小限制（适用于大于 1MB 小于 10 MB 的消息）

这里我们需要修改 broker, consumer, producer  3 个部分的配置，以允许处理更大的消息。

### Broker  服务端
在 broker 端有两种修改最大消息大小的方式：
- 1. `message.max.bytes` 静态参数在 broker 级别生效，影响所有的 topic，需要修改 server.properties 文件，并重启 Kafka 集群。
- 2. `max.message.bytes` 动态参数在 topic 级别生效，只影响指定的 topic，修改后立即生效，无需重启 Kafka 集群。

建议保留 broker 级别最大消息大小的默认值（1MB），仅在 topic 级别覆盖此设置。

可以在创建 topic 的时候指定动态配置参数，例如创建一个名叫 `large-message` 的 topic，指定 `max.message.bytes` 为 10MB。
```bash
kafka-topics.sh --bootstrap-server localhost:9092 \
--create --topic large-message \
--config max.message.bytes=10485880
```

也可以在已创建的 topic 上修改该配置参数。
```bash
kafka-configs.sh --bootstrap-server localhost:9092 \
                --alter --entity-type topics \
                --entity-name large-message \
                --add-config max.message.bytes=10485880
```

查看 `large-message` topic 的动态配置参数。
```bash
kafka-configs.sh --bootstrap-server localhost:9092 \ 
--entity-type topics --entity-name large-message --describe

# 返回结果
Dynamic configs for topic large-message are:

# DYNAMIC_TOPIC_CONFIG 是此时生效的配置 10MB，DEFAULT_CONFIG 是默认配置 1M。
  max.message.bytes=10485880 sensitive=false synonyms={DYNAMIC_TOPIC_CONFIG:max.message.bytes=10485880, DEFAULT_CONFIG:message.max.bytes=1048588}
```

现在我们已经修改了 topic 的最大消息大小，但这还不够，**我们还需要设置 `replica.fetch.max.bytes=10485880`（默认也是 1MB），以便大消息可以正常复制到 broker 的副本中。** 该参数是静态配置，只能在 `server.properties` 配置文件中修改，并且需要重启 Kafka 集群才能生效。

如果没有修改 `replica.fetch.max.bytes` 参数，当往 leader replica 写入大消息时，follower replica 会因为无法复制该消息产生如下报错。
```bash
[2022-06-17 09:15:08,717] ERROR [ReplicaManager broker=1] Error processing fetch with max size 1048576 from replica [2] on partition large-message-0: PartitionData(fetchOffset=410683670, logStartOffset=395947464, maxBytes=1048576, currentLeaderEpoch=Optional[0], lastFetchedEpoch=Optional.empty) (kafka.server.ReplicaManager)
org.apache.kafka.common.errors.CorruptRecordException: Found record size 0 smaller than minimum record overhead (14) in file /data/large-message-0/00000000000410481778.log.
```

### Consumer 消费者

在 consumer 端需要修改 `max.partition.fetch.bytes` 参数的值，以便可以消费大消息，需要确保该值**大于等于** broker 上配置的 `message.max.bytes`，否则一旦消息大于`max.partition.fetch.bytes` 的值，消费者将无法拉取到这条消息，从而导致消费进度卡住。

在 CLI 中可以使用可以使用 `--consumer-property` 参数进行设置。
```bash
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
    --topic large-message \
    --from-beginning \
    --consumer-property max.partition.fetch.bytes=10485880
```

在 Java 代码中可以这样设置。
```java
properties.setProperty(ConsumerConfig.FETCH_MAX_BYTES_CONFIG, "10485880");
```

如果你使用 Logstash 作为消费者，可以这样设置。需要注意的是，在 Logstash 中 `max_partition_fetch_bytes` 参数的类型在不同的版本中是不一样的，例如在 7.7 版本中是 STRING 类型，而在 7.8 版本开始变为 NUMBER 类型。
```bash
input {
    kafka {
       bootstrap_servers => "localhost:9092"
       topics => ["large-message"]
       max_partition_fetch_bytes => "10485880"  # 设置最大消费消息大小
    }
}
```


### Producer 生产者
在 producer 端需要修改 `max.request.size` 参数的值，以便可以发送大消息，要确保该值**小于等于** broker 上配置的 `message.max.bytes`。

在 CLI 中可以使用可以使用 `--consumer-property` 参数进行设置。
```bash
kafka-console-producer.sh --bootstrap-server localhost:9092 \
    --topic large-message \
    --producer-property max.request.size=10485880
```

在 Java 代码中可以这样设置。
```bash
properties.setProperty(ProducerConfig.MAX_REQUEST_SIZE_CONFIG, "10485880");
```

如果使用 Filebeat 作为生产者，可以这样设置。大于 `max_message_bytes` 的消息将会被丢弃，不会发送给 Kafka。
```bash
output:
  kafka:
    hosts: ["localhost:9092"]
    topic: large-message
    max_message_bytes: 10485880 # 设置最大生产消息大小
```
## 参考资料
- [1] How to send Large Messages in Apache Kafka: https://www.conduktor.io/kafka/how-to-send-large-messages-in-apache-kafka
- [2] Kafka input plugin: https://www.elastic.co/guide/en/logstash/7.7/plugins-inputs-kafka.html#plugins-inputs-kafka-`max_partition_fetch_bytes

## 欢迎关注
![](https://chengzw258.oss-cn-beijing.aliyuncs.com/Article/20220104221116.png)
