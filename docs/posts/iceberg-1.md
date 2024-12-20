---
date: 2024-12-19
category:
  - CategoryA
tag:
  - tag A
  - tag B
---

# Iceberg 1

## Iceberg是什么？

Iceberg官网描述如下:

Apache Iceberg is an open table format for huge analytic datasets. Iceberg adds tables to Presto and Spark that use a high-performance format that works just like a SQL table.

Iceberg 的官方定义是一种表格式，可以简单理解为是基于计算层（Flink , Spark）和存储层（ORC，Parqurt，Avro）的一个中间层，用 Flink 或者 Spark 将数据写入 Iceberg，然后再通过其他方式来读取这个表，比如 Spark，Flink，Presto 等。


## Iceberg 的 table format 介绍

Iceberg 是为分析海量数据准备的，被定义为 table format，table format 介于计算层和存储层之间。

table format  主要用于向下管理在存储系统上的文件，向上为计算层提供一些接口。存储系统上的文件存储都会采用一定的组织形式，譬如读一张 Hive 表的时候，HDFS 文件系统会带一些 partition，数据存储格式、数据压缩格式、数据存储 HDFS 目录的信息等，这些信息都存在 Metastore 上，Metastore 就可以称之为一种文件组织格式。

一个优秀的文件组织格式，如 Iceberg，可以更高效的支持上层的计算层访问磁盘上的文件，做一些 list、rename 或者查找等操作。
