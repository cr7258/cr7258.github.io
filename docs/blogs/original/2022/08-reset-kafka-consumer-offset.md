---
title: 如何重置 Kafka 中的 Consumer Offset？
author: Se7en
date: 2022/05/06 20:00
categories:
 - 原创
tags:
 - Kafka
---

# 如何重置 Kafka 中的 Consumer Offset？

## 获取 Consumer Offset
使用 `kafka-consumer-groups.sh` 命令加上 group id 和 describe 参数查询对应 consumer group 的消费进度。

```bash
kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --group my-group \
    --describe

# 返回结果
GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG             CONSUMER-ID                HOST            CLIENT-ID
my-group        test-topic      0          5509            5515            6               rdkafka-39404560-f8f2-4b0b /151.62.82.140  rdkafka
```
`CURRENT-OFFSET` 表示 consumer group 在分区当前消费到的偏移量， `LOG-END-OFFSET` 指的是分区中最新生产的消息的偏移量，`LAG` 的值等于  LOG-END-OFFSET -  CURRENT-OFFSET，表示 consumer 消费滞后区间，正常情况下 LAG 的值应当比较小，如果过大说明消费跟不上生产速度，需要引起注意。

consumer group 可以使用以下命令查询。
 ```bash
 kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --list
 ```
## 修改 Consumer Offset
使用 `kafka-consumer-groups.sh` 命令指定 topic, consumer group，使用 `–reset-offsets` 参数修改偏移量。如下所示，将 `test-topic` topic 中 `my-group` consumer group 的偏移量重置为 topic 中最早的偏移量。此命令将会重置  `my-group` consumer group 在 `test-topic ` topic 中所有 partition 的偏移量，如果想要重置 topic 中指定的 partition 的偏移量，可以通过 `--topic <topicname>:<partition>` 的方式设置，例如 --topic test-topic:0 表示只重置 `test-topic` topic 中 0 分区的偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --to-earliest --execute
```
## Consumer Offset 参数
`–reset-offsets` 参数有以下几个选项可供选择：
- `--to-earliest`：重置为 topic 中最早的偏移量。
- `--to-latest`：重置为 topic 中最新的偏移量。
- `--to-offset`：重置为指定的偏移量。
- `--shift-by`：相对当前偏移量前后移动偏移量。
- `--to-datetime`：根据时间戳重置偏移量。

### --to-earliest
`--to-earliest` 参数重置为 topic 中最早的偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --to-earliest --execute
```
### --to-latest
`--to-earliest` 参数重置为 topic 中最新的偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --to-latest --execute
```
### --to-offset
`--to-offset` 参数重置为指定的偏移量，后面跟正整数。如下所示，将偏移量重置为 5510。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --to-offset 5510 --execute
```

### --shift-by
`--shift-by` 参数相对当前偏移量前后移动偏移量，后面可以跟正整数或负整数。如下所示，相对当前偏移量 +10 重置偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --shift-by 10 --execute
```

如下所示，相对当前偏移量 -10 重置偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --shift-by -10 --execute
```

### --to-datetime
`--to-datetime` 参数根据时间戳重置偏移量，后面跟 **YYYY-MM-DDTHH:mm:SS.sss** 格式的时间戳。如下所示，将偏移量重置到 2020-11-01T00:00:00Z 时间的偏移量。
```bash
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
--group my-group --topic test-topic \
--reset-offsets --to-datetime 2020-11-01T00:00:00Z --execute
```
## 参考资料
- [1] View and reset consumer group offsets: https://developer.aiven.io/docs/products/kafka/howto/viewing-resetting-offset
- [2] How to change or reset consumer offset in Kafka:  https://www.hadoopinrealworld.com/how-to-change-or-reset-consumer-offset-in-kafka/
