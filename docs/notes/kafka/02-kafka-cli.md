---
title: kafka命令合集
tag: kafka
outline: deep
---

# Kafka命令合集

## kafka-topics.sh

```java

#!/bin/bash

# 1. 创建主题
# --create: 创建主题
# --bootstrap-server: 指定Kafka服务器地址
# --topic: 主题名称
# --partitions: 分区数
# --replication-factor: 副本因子
kafka-topics.sh --create \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --partitions 4 \
    --replication-factor 2

# 2. 列出所有主题
# --list: 列出所有主题
kafka-topics.sh --list \
    --bootstrap-server localhost:9092

# 3. 查看主题详情
# --describe: 查看主题详细信息
# --topic: 指定主题名称
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topic my-topic

# 4. 增加分区数
# --alter: 修改主题配置
# --partitions: 新的分区数(只能增加不能减少)
kafka-topics.sh --alter \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --partitions 8

# 5. 删除主题
# --delete: 删除主题
kafka-topics.sh --delete \
    --bootstrap-server localhost:9092 \
    --topic my-topic

# 6. 自定义副本分配创建主题
# --replica-assignment: 手动指定分区副本分配方案
# 格式: "broker_id:broker_id,broker_id:broker_id"
kafka-topics.sh --create \
    --bootstrap-server localhost:9092 \
    --topic custom-topic \
    --replica-assignment "1:2,2:3,3:1"

# 7. 创建带配置的主题
# --config: 指定主题级别的配置
kafka-topics.sh --create \
    --bootstrap-server localhost:9092 \
    --topic configured-topic \
    --partitions 4 \
    --replication-factor 2 \
    --config cleanup.policy=delete \
    --config retention.ms=604800000 \
    --config segment.bytes=1073741824

# 8. 查看特定分区的详情
# --topic: 指定主题
# --partition: 指定分区
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --partition 0

# 9. 查看主题的配置覆盖
# --describe: 查看配置
# --entity-type: 实体类型(topics)
# --entity-name: 主题名称
kafka-configs.sh --describe \
    --bootstrap-server localhost:9092 \
    --entity-type topics \
    --entity-name my-topic

# 10. 修改主题配置
# --alter: 修改配置
# --add-config: 添加或修改配置
kafka-configs.sh --alter \
    --bootstrap-server localhost:9092 \
    --entity-type topics \
    --entity-name my-topic \
    --add-config retention.ms=86400000

# 11. 删除主题配置
# --delete-config: 删除配置项
kafka-configs.sh --alter \
    --bootstrap-server localhost:9092 \
    --entity-type topics \
    --entity-name my-topic \
    --delete-config retention.ms

# 12. 查看主题的分区副本分配情况
# --topics-with-overrides: 显示所有配置被覆盖的主题
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topics-with-overrides

# 13. 查看未同步的副本
# --under-replicated-partitions: 显示所有未完成同步的分区
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --under-replicated-partitions

# 14. 查看没有leader的分区
# --unavailable-partitions: 显示所有没有leader的分区
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --unavailable-partitions

# 15. 批量查看多个主题
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topic "topic1,topic2,topic3"

# 16. 查看主题的详细指标
kafka-topics.sh --describe \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --report-detailed
```

## kafka-cluster.sh

```java
#!/bin/bash

# kafka-cluster.sh 命令行工具主要用于管理Kafka集群

# 1. 查看集群中的broker列表
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# 2. 查看集群状态
# 显示所有broker的状态信息
kafka-cluster.sh --bootstrap-server localhost:9092 --describe

# 3. 查看集群控制器信息
# 显示当前的控制器(Controller)节点信息
kafka-cluster.sh --bootstrap-server localhost:9092 --describe --entity-type controller

# 4. 查看broker信息
# 显示指定broker的详细信息
kafka-cluster.sh --bootstrap-server localhost:9092 --describe --entity-type brokers --entity-name 0

# 5. 查看集群配置
kafka-cluster.sh --bootstrap-server localhost:9092 --describe --entity-type brokers --entity-default

# 6. 修改集群配置
kafka-configs.sh --bootstrap-server localhost:9092 \
    --entity-type brokers \
    --entity-name 0 \
    --alter \
    --add-config "log.retention.hours=168"

# 7. 查看动态配置
kafka-configs.sh --bootstrap-server localhost:9092 \
    --entity-type brokers \
    --entity-name 0 \
    --describe

# 8. 删除动态配置
kafka-configs.sh --bootstrap-server localhost:9092 \
    --entity-type brokers \
    --entity-name 0 \
    --alter \
    --delete-config "log.retention.hours"

# 9. 查看集群分区分配
kafka-cluster.sh --bootstrap-server localhost:9092 \
    --describe \
    --entity-type partitions

# 10. 查看集群元数据
kafka-metadata-shell.sh --bootstrap-server localhost:9092

# 11. 查看集群健康状态
kafka-cluster.sh --bootstrap-server localhost:9092 --health

# 12. 查看集群ACL
kafka-acls.sh --bootstrap-server localhost:9092 --list

```

## kafka-console-producer.sh

```java
#!/bin/bash

# kafka-console-producer.sh 命令行工具用于生产消息到Kafka主题

# 1. 基本生产消息命令
# 最简单的生产消息方式，输入消息后按回车发送，按Ctrl+C退出
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic

# 2. 带key的消息生产
# 使用tab分隔符分隔key和value
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property parse.key=true \
    --property key.separator="\t"

# 3. 指定分区生产消息
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property partition=0

# 4. 批量从文件读取消息
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    < messages.txt

# 5. 带消息属性的生产
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property "parse.key=true" \
    --property "key.separator=:" \
    --property "compression.type=gzip"

# 6. 同步发送消息
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --sync

# 7. 指定生产者配置
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --producer-property acks=all \
    --producer-property batch.size=16384 \
    --producer-property linger.ms=1

# 8. 发送带时间戳的消息
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property "parse.key=true" \
    --property "key.separator=:" \
    --property "timestamp.type=CreateTime"

# 高可靠性配置
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --producer-property acks=all \
    --producer-property min.insync.replicas=2 \
    --producer-property enable.idempotence=true

# 高性能配置
kafka-console-producer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --producer-property batch.size=65536 \
    --producer-property linger.ms=20 \
    --producer-property compression.type=lz4
```

## kafka-console-consumer.sh

```java
#!/bin/bash

# kafka-console-consumer.sh 命令行工具用于消费Kafka主题中的消息

# 1. 基本消费命令
# 从最新位置开始消费消息
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic

# 2. 从头开始消费
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --from-beginning

# 3. 显示消息的key
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property print.key=true \
    --property key.separator=":"

# 4. 显示消息的时间戳
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property print.timestamp=true

# 5. 显示分区信息
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property print.partition=true

# 6. 显示offset信息
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property print.offset=true

# 7. 指定分区消费
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --partition 0

# 8. 指定offset消费
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --partition 0 \
    --offset 1000

# 9. 使用消费者组
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --group my-group

# 10. 设置消费超时
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --timeout-ms 10000

# 11. 显示所有消息属性
kafka-console-consumer.sh \
    --bootstrap-server localhost:9092 \
    --topic my-topic \
    --property print.key=true \
    --property print.value=true \
    --property print.partition=true \
    --property print.offset=true \
    --property print.timestamp=true \
    --property key.separator=":" \
    --property line.separator="\n"
```