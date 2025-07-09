---
title: Paimon tables
tags: Paimon
outline: deep
---

# 主键表和Append Only表

## 主键表
Paimon主键（Primary Key）表：表中每一行数据都有一个唯一主键，用来表示唯一的一行数据。

```
CREATE TABLE if not exists paimon.test.bucket_num (
 `id` Int,
  `name` String,
  `age` Int,
  `dt` string,
   PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
);
```

### 分桶方式
Bucket 桶是Paimon表读写操作的最小单元。非分区、分区的数据都会写入到对应的桶中。

创建Paimon主键表时，在WITH参数中指定'bucket' = '<num>'  
1. '<num>'  为2、3正数的则是固定桶
2. '<num>' 值为 -1，或者不写buckent=…… 则表示动态桶

```
CREATE TABLE if not exists paimon.test.bucket_num (
 `id` Int PRIMARY KEY NOT ENFORCED,
  `name` String,
  `age` Int,
  `dt` string,
   PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '2'， -- bucket=4  固定分桶、'bucket' = '-1' 动态分桶
 'merge-engine' = 'deduplicate'， -- deduplicate 是默认值，可以不设置，相同的主键数据，保留最新的
 'file.format'='avro' --格式 parquet、orc、avro
);
```

### 固定桶主键表 Fixed Bucket

1. 有分区键的情况下 主键字段必须包括分区字段 。
2. Bucket 个数会影响并发度，影响性能，建议每个分桶的数据大小在2 GB左右，最大不超过5 GB。

```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '2',
 'file.format'='avro',
 'sink.parallelism' = '2' 
);
```

注意：分桶数限制了实际工作的作业并发数，单个分桶内数据总量太大可能导致读写性能的降低。

**假如有多个作业（insert into）如何支持写入一张表？**

如果要支持多个insert into table select …… 写入到相同的一张表
设置参数  'write-only'='true' （单独启动一个Dedicated Compaction Job）
否则会报错：Conflicts during commits. Multiple jobs are writing into the same partition at the same time.

```
 'write-only'='true' --取决于是否多个任务写一张表

CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '2',
 'file.format'='avro',
 'sink.parallelism' = '2',
  'write-only'='true' 
);

// two job
========================================
insert into  paimon.test.bucket2 select id,name,age,date_format(CURRENT_TIMESTAMP,'yyyyMMdd') from default_catalog.default_database.datagen1 ;

insert into  paimon.test.bucket2 select id,name,age,date_format(CURRENT_TIMESTAMP,'yyyyMMdd') from default_catalog.default_database.datagen1 ;

```

### 动态分桶主键表 Dynamic Bucket

注意：动态分桶表的主键可以包含分区字段也可以包含不分区字段。

Paimon will automatically expand the number of buckets.
- Option1: 'dynamic-bucket.target-row-num': controls the target row number for one bucket.
- Option2: 'dynamic-bucket.initial-buckets': controls the number of initialized bucket.
- Option3: 'dynamic-bucket.max-buckets': controls the number of max buckets.

#### 主键包括分区键

```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '-1',
  'merge-engine' = 'deduplicate',
 'file.format'='avro',
 'sink.parallelism' = '2' 
);
```

paimon表可以确定该主键属于哪个分区，但是确定不来属于哪个分桶。需要额外的堆内存创建**索引**，以维护主键与分桶编号的映射关系。

主键完全包含分区键的动态分桶表，Paimon可以确定该主键属于哪个分区，无法确定属于哪个分桶，因此需要使用额外的堆内存创建索引(index)，维护主键与分桶编号的映射关系。

具体来说，每1亿条主键将额外消耗1 GB的堆内存。只有当前正在写入的分区才会消耗堆内存，历史分区中的主键不会消耗堆内存。

```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id,dt) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '-1',
 'file.format'='avro',
 'sink.parallelism' = '2' 
);

insert into paimon.test.bucket2 values
(1,'zhangsan',18,'2023-01-01'),
(1,'zhangsan',18,'2023-01-02'),
(1,'zhangsan',18,'2023-01-03');

// 查询返回3条数据
```

#### 主键不包括分区键

```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '-1',
  'merge-engine' = 'deduplicate',
 'file.format'='avro',
 'sink.parallelism' = '2' 
);
```

1. 如果主键不包含分区键，Paimon无法根据主键确定该数据属于哪个分区的哪个分桶，使用RocksDB维护主键与分区以及分桶编号的映射关系
2. 对性能会造成明显影响，1.维护映射关系。2.每次作业启动的时候，需要将映射关系全量加到RocksDB中，作业启动也会相对变慢。

```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string,
  PRIMARY KEY (id) NOT ENFORCED
) PARTITIONED BY (dt) with  (
 'bucket' = '-1',
 'file.format'='avro',
 'sink.parallelism' = '2' 
);

insert into paimon.test.bucket2 values
(1,'zhangsan',18,'2023-01-01'),
(1,'zhangsan',18,'2023-01-02'),
(1,'zhangsan',18,'2023-01-03');

// 查询返回一条数据，因为主键id一样

CREATE TABLE my_table (id bigint,product_id BIGINT,price DOUBLE,sales BIGINT) 
PARTITIONED BY (id) WITH ('bucket' = '3','bucket-key' = 'product_id');
```

#### 主键表 fixed bucket，dynamic bucket

固定桶：不支持跨分区更新（因为分区键必须包含在主键中，直接通过hash确定数据在哪个桶）

动态桶（主键不包括分区字段）：支持跨分区更新
动态桶（主键包括分区字段）： 可以确定分区，不支持跨分区更新

#### 桶的更新

1. 固定桶支持动态调整桶的大小。
2. 当分桶的数据量超过限制时，再自动创建新的分桶。创建新桶的条件
- dynamic-bucket.target-row-num：每个分桶最多存储几条数据。默认值为2000000。
- dynamic-bucket.initial-buckets：初始的分桶数。如果不设置，初始将会创建等同于writer算子并发数的分桶。
- dynamic-bucket.max-buckets: 最大分桶数。

## Append Only表（非主键表）

如果在创建Paimon表时没有指定主键（Primary Key），则该表就是Paimon Append Only表。只能以流式方式将完整记录插入到表中，适合不需要流式更新的场景（例如日志数据同步）。

两种模式：Scalable 表 与 Queue 表。

```
0.9.0新特性
Append 表的删改支持：此版本引入了 Append 的 DELETE & UPDATE & MERGEINTO 支持，你可以通过 Spark SQL 来删改 Append 表，并且它还支持 Deletion Vectors 模式
```

### Scalable表

定义 bucket 为 -1，且没有主键时，就是一张增强的 Hive 表，没有桶的概念 (数据会放到 bucket-0 目录中，桶是被忽略的，所有的读写并没有并发限制)，支持批写批读，支持流写流读，只是它的流读会有一部分乱序 (并不是完全的输入顺序)。

注意：适合对数据的流式消费顺序没有需求场景。

```
CREATE TABLE if not exists paimon.test.bucket2(
  id bigint,
  name String,
  age Int,
  dt string
) PARTITIONED BY (dt) with  (
 'bucket' = '-1'
);

insert into paimon.test.bucket2 values
(1,'zhangsan',18,'2023-01-01'),
(1,'zhangsan',18,'2023-01-02'),
(1,'zhangsan',18,'2023-01-03');

```

### Queue表

作为消息队列具有分钟级延迟的替代。Paimon表的分桶数此时相当于Kafka的Partition数。
数据在每个bucket里面默认有序
```
CREATE TABLE if not exists paimon.test.bucket2 (
  id bigint,
  name String,
  age Int,
  dt string
)  with  (
 'bucket' = '5',
 'bucket-key' = 'id'
);

insert into paimon.test.bucket2 values
(1,'zhangsan',18,'2023-01-01'),
(2,'zhangsan',18,'2023-01-01'),
(3,'zhangsan',18,'2023-01-02'),
(3,'zhangsan',18,'2023-01-02'),
(4,'zhangsan',18,'2023-01-02'),
(5,'zhangsan',18,'2023-01-02'),
(6,'zhangsan',18,'2023-01-02'),
(7,'zhangsan',18,'2023-01-02'),
(8,'zhangsan',18,'2023-01-03');

// 会创建出5个桶
```


### Scalable表 vs Queue表

#### 数据分发

Scalable ：没有桶的概念，无需考虑数据顺序、无需对数据进行hash partitioning，多个并发可以同时写同一个分区，Scalable 表写入速度更快。

Queue ：默认情况下，Paimon将根据每条数据所有列的取值，确定该数据属于哪个分桶（bucket）。也可以在创建Paimon表时，在WITH参数中指定bucket-key参数，不同列的名称用英文逗号分隔。例如，设置'bucket-key' = 'c1,c2'，则Paimon将根据每条数据c1和c2两列的值，确定该数据属于哪个分桶。

#### 数据消费顺序

Scalable ：不能保证数据的消费顺序和写入顺序，适合对数据的流式消费顺序没有需求场景。

Queue ：表可以保证流式消费Paimon表时，每个分桶中数据的消费顺序与数据写入Paimon表的顺序一致。具体来说：

- 如果表参数中设置了'scan.plan-sort-partition' = 'true'，则分区内值更小的数据会首先产出。
- 如果表参数中未设置'scan.plan-sort-partition' = 'true'，则分区内创建时间更早的数据会首先产出，先进先出。
- 对于两条来自相同分区的相同分桶的数据，先写入Paimon表的数据会首先产出。
- 对于两条来自相同分区但不同分桶的数据，由于不同分桶可能被不同的Flink作业并发处理，因此不保证两条数据的消费顺序。

