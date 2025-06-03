---
title: Iceberg
tags: Iceberg
outline: deep
---

# Flink 与 Iceberg 集成

## 创建 Flink Catalog

```
drop table if exists hdfs_t1;
CREATE TABLE hdfs_t1 (
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP
) WITH (
'connector' = 'iceberg',
'catalog-name' = 'hdfs_prod', 
'catalog-database' = 'hdfs_db',
'catalog-type' = 'hadoop', -- 指定 Catalog 类型为 Hadoop
'warehouse' = 'hdfs://mj01:8020/lakehouse'  -- 数据存储路径
);

EXECUTE STATEMENT SET
BEGIN 
INSERT INTO hdfs_t1  values (1,'t2','20250209',current_timestamp);
END;
```

### Hadoop Catalog
```
CREATE CATALOG ice_hdfs WITH (
  'type'='iceberg',
  'catalog-type'='hadoop',
  'warehouse'='hdfs://mj01:8020/lakehouse/ice_hdfs'
);
create database if not exists ice_hdfs.mj1;
```

### Hive Catalog
```
CREATE CATALOG ice_hive WITH (
  'type'='iceberg',
  'catalog-type'='hive',
  'uri'='thrift://mj02:9083',
  'warehouse'='hdfs://mj01:8020/lakehouse/ice_hive'
);

create database if not exists ice_hive.mj1;
```

## Flink 与 Iceberg DDL

### 创建表

#### 基础语法
```
drop table if exists ice_hdfs.mj1.t1;
CREATE TABLE ice_hdfs.mj1.t1(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP,
    PRIMARY KEY(id) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）
) WITH (
  'format-version'='2'  -- Iceberg 表格式版本
);
INSERT INTO ice_hdfs.mj1.t1 values (2,'t1','20250209',current_timestamp);

```

#### 分区表
  - Iceberg 支持隐藏分区（如按日期分区），但 Flink 目前不支持在 DDL 中直接使用函数进行分区（如 PARTITIONED BY (days(ts))）。
  - 如果需要在 Flink 中使用隐藏分区，建议在 Iceberg 表创建后通过 API 或 Spark 实现。

```
drop table if exists ice_hdfs.mj1.t2;
CREATE TABLE ice_hdfs.mj1.t2(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP,
     PRIMARY KEY(id) NOT ENFORCED  
    ) PARTITIONED BY (dt)   WITH (
  'format-version'='2'  -- Iceberg 表格式版本
);

INSERT INTO ice_hdfs.mj1.t2  values (1,'t2','20250209',current_timestamp);
--
drop table if exists ice_hdfs.mj1.t3;
CREATE TABLE ice_hdfs.mj1.t3(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP,
     PRIMARY KEY(id,dt) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）
    ) PARTITIONED BY (dt)   WITH (
  'format-version'='2',  -- Iceberg 表格式版本
  'write.upsert.enabled'='true'  -- 启用 Upsert
);
INSERT INTO ice_hdfs.mj1.t3   values (1,'t3','20250209',current_timestamp),
 (1,'t4','20250209',current_timestamp);
==========================================
drop table if exists ice_hdfs.mj1.t4;
CREATE TABLE ice_hdfs.mj1.t4(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP)  
PARTITIONED BY (dt,hours(ts),bucket(3, id));
INSERT INTO ice_hdfs.mj1.t4   values (1,'t44','20250209',current_timestamp),
 (1,'t4','20250209',current_timestamp);
```

#### 复制表结构（CREATE TABLE LIKE）
复制表结构、分区及属性

```
CREATE TABLE ice_hdfs.mj1.t11 LIKE ice_hdfs.mj1.t1;
```

### 修改表
#### 修改表属性
```
-- 修改写入格式
ALTER TABLE ice_hdfs.mj1.t11 SET ('write.format.default'='avro');  
==========
INSERT INTO ice_hdfs.mj1.t11  values (1,'t44','20250209',current_timestamp),
 (1,'t4','20250209',current_timestamp);
```

#### 重命名表
  - Hadoop Catalog不支持修改
  - Hive Catalog 支持修改
```
ALTER TABLE ice_hdfs.mj1.t11 RENAME TO ice_hdfs.mj1.t111;
-----------------------------
CREATE TABLE ice_hive.mj1.t1(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP,
    PRIMARY KEY(id) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）
) WITH (
  'format-version'='2'  -- Iceberg 表格式版本
);
ALTER TABLE ice_hive.mj1.t1 RENAME TO ice_hive.mj1.t112;
```

### 删除表

```
DROP TABLE ice_hdfs.mj1.t11; 
```

## Flink 与 Iceberg Write

### 追加写入(Insert Into)
同一个分区保证唯一值（有主键的情况下）。
```
-- t1为主键表无分区，t2为主键表有分区(分区为第三column)

-- 最终插入三条数据，虽然主键相同，但分区不同。分区不同不保证唯一性。
INSERT INTO ice_hdfs.mj1.t2 values (1,'111','111',current_timestamp),
(1,'222','222',current_timestamp),(1,'333','333',current_timestamp);

-- 最终插入一条数据(数据为333)，无分区，主键相同保证唯一。
INSERT INTO ice_hdfs.mj1.t1 values (1,'111','111',current_timestamp),
(1,'222','222',current_timestamp),(1,'333','333',current_timestamp);

-- 最终插入一条数据(数据为333)，主键和分区都相同
INSERT INTO ice_hdfs.mj1.t2 values (1,'111','11a',current_timestamp),
(1,'222','11a',current_timestamp),(1,'333','11a',current_timestamp);

INSERT INTO ice_hdfs.mj1.t2 select * from ice_hdfs.mj1.t2 ;

```

### 覆盖写入 (Insert Overwrite)
注意：流处理不支持OVERWRITE

1. 如果表没有分区则全部覆盖

```
INSERT OVERWRITE ice_hdfs.mj1.t1 SELECT 2,'qqqqqq','11',current_timestamp;
```

2. 如果表分区了，插入时指定了dt='xxx'、则覆盖对应的分区
```
INSERT OVERWRITE ice_hdfs.mj1.t2 PARTITION(dt='333') SELECT 2,'11bbbbb',current_timestamp;
```
3. 如果表分区了，插入时不指定dt='xxx'、则动态匹配对应的分区
```
INSERT OVERWRITE ice_hdfs.mj1.t2 SELECT 1,'qqqqqq','333',current_timestamp union  SELECT 1,'qqqqqq','222',current_timestamp;

INSERT OVERWRITE ice_hdfs.mj1.t2 SELECT 2,'qqqqqq','333',current_timestamp union  SELECT 2,'qqqqqq','222',current_timestamp;
```

```
SET 'execution.runtime-mode' = 'batch';
SET 'sql-client.execution.result-mode' = 'tableau';
```

### Upsert

Iceberg在将数据写入v2表格式时支持基于主键的UPSERT。
- 创表的时候指定 'write.upsert.enabled'='true'
```
INSERT INTO ice_hdfs.mj1.t3  values (1,'t3','20250209',current_timestamp);
INSERT INTO ice_hdfs.mj1.t3  values (1,'t5','20250209',current_timestamp);
```

- Insert into的时候指定 'upsert-enabled'='true'
```
INSERT INTO ice_hdfs.mj1.t1  values (1,'t3','20250209',current_timestamp);
INSERT INTO ice_hdfs.mj1.t1  values (1,'t4','20250209',current_timestamp);

INSERT INTO ice_hdfs.mj1.t1 /*+ OPTIONS('upsert-enabled'='true') */ values (1,'t5','20250209',current_timestamp);
```

## Flink与Iceberg Query

### 核心特性
1. 双模式支持
  - 支持 流式（Streaming） 和 批处理（Batch） 读取
  - 兼容 Flink 的 DataStream API 和 Table API/SQL
2. 关键能力
  - 增量数据消费（从指定快照/标签/分支开始）
  - FLIP-27 新Source源支持

### SQL 读取模式
批处理读取
```
SET execution.runtime-mode = batch;
-- 全量读取表数据
SELECT * FROM ice_hdfs.mj1.t1; 
```

### 流式读取
增量读取
```
SET execution.runtime-mode = streaming;
 -- 启用动态表选项
SET table.dynamic-table-options.enabled=false;

-- 从当前快照开始持续读取增量数据 monitor_interval 监控数据的间隔，默认1s
SELECT * FROM ice_hdfs.mj1.t1 /*+ OPTIONS('streaming'='true', 'monitor-interval'='1s')*/ ;
```

读取指定快照
```
-- 从指定快照开始读取（不包含该快照数据）
SELECT * FROM ice_hdfs.mj1.t1 /*+ OPTIONS('streaming'='true', 'start-snapshot-id'='915345587701634958')*/ ;

```

读取分支，标签
```
SET table.exec.iceberg.use-flip27-source = true;
--- 读取分支
SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS('branch'='branch1') */ ;
--- 读取Tag
SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS('tag'='tag1') */;



SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS('streaming'='true', 'monitor-interval'='1s', 'start-tag'='tag1') */;

```

## Flink 与 Iceberg API

pom.xml
```
<dependency>
    <groupId>org.apache.iceberg</groupId>
    <artifactId>iceberg-flink-runtime-1.19</artifactId>
    <version>${iceberg.version}</version>
</dependency>
```

Compact

```
public class RewrietDataFiles {
    public static void main(String[] args) {

        //1.配置TableLoader
        Configuration hadoopConf = new Configuration();

        //2.创建Hadoop配置、Catalog配置和表的Schema
        Catalog catalog = new HadoopCatalog(hadoopConf,"file:///D:/ice_hdfs/");

        //3.配置iceberg 库名和表名并加载表
        TableIdentifier name =
                TableIdentifier.of("mj1", "t1");
        Table table = catalog.loadTable(name);

        //4..合并 data files 小文件
        RewriteDataFilesActionResult result = Actions.forTable(table)
                .rewriteDataFiles()
                //默认 512M ，
                .targetSizeInBytes(536870912L)
                .execute();

    }

}
```

## 案例 Spark 建表
```
spark-sql --hiveconf hive.cli.print.header=true
set spark.sql.catalog.ice_hdfs = org.apache.iceberg.spark.SparkCatalog;
set spark.sql.catalog.ice_hdfs.type = hadoop;
set spark.sql.catalog.ice_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_hdfs ;
use ice_hdfs;
create database if not exists ice_hdfs.mj1;

drop table if exists ice_hdfs.mj1.t4;
CREATE TABLE ice_hdfs.mj1.t4(
    id BIGINT NOT NULL COMMENT '主键',
    data STRING,
    dt String,
    ts TIMESTAMP)
    USING iceberg
PARTITIONED BY (dt,hours(ts),bucket(3, id))
TBLPROPERTIES ('format-version'='2');
INSERT INTO ice_hdfs.mj1.t4   values (1,'t11','20250209',current_timestamp),
 (1,'t4','20250209',current_timestamp);
ALTER TABLE ice_hdfs.mj1.t4 CREATE TAG  `tag1`; 
ALTER TABLE ice_hdfs.mj1.t4 CREATE BRANCH `branch1`;
INSERT INTO ice_hdfs.mj1.t4   values (1,'t44','20250209',current_timestamp),
 (1,'t4','20250209',current_timestamp);
ALTER TABLE ice_hdfs.mj1.t4 CREATE TAG  `tag2`; 
```