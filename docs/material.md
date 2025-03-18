
> 这篇文章整理了 Iceberg，Paimon，Fluss，以及Flink 2.0的一些特性和资料。

## Iceberg

Iceberg是一种用于大型分析表的高性能格式。Iceberg为大数据带来了SQL表的可靠性和简单性，同时使Spark、Trino、Flink、Presto、Hive和Impala等引擎能够同时安全地使用相同的表。

Iceberg设计初衷是为了解决Hive离线数仓计算慢等一系列问题，经过迭代发展成为构建数据湖服务的表格式。

Iceberg存储层支持元数据、数据文件保存到分布式文件系统（HDFS、S3）上的表级别的的组织形式，同时支持一系列特性对存储的表格式进行操作，比如合并、快照、分支、标签。

因为Iceberg仅仅是一种数据组织的形式（表格式）。所以对上层支持市面上各种引擎基于表格式进行操作。

### Hive的历史问题

Hudi、Iceberg、Paimon存储层表格式诞生之初，百分之99的数仓都是以为Hive为主的数仓架构设计。

基于Hive数据仓库的痛点

- 痛点1
  - 1.1 不支持行级删除，修改成本高
  - 1.2 不支持upsert修改场景
  - 1.3 不支持ACID事务
- 痛点2
  - 2.1 不支持增量读取，不支持批流统一
  - 2.2 分析时效达不到分钟级别，数据达不到准实时
- 痛点3
  - 3.1 Schema变更能力差
  - 3.2 Partition策略变更能力差

链路风险：

- 几乎都是T+1的延迟，失败重试（有时复杂任务重试成本很大）。
- Lambda架构运维成本高、容易出现数据不一致。
- Hive Metastore访问压力大。

### Iceberg相比较Hive的优势

特性支持：
- 基于快照实现ACID能力。
- Schema Evolution&Partition Evolution。
- 支持HDFS、S3、OSS、minio。

链路优势：
- 支持Flink、Spark近实时的写入，T+1延迟降低为分钟级别。
- 实现流批一体、湖仓一体架构降低运维成本
- 支持Hive Catalog、Hadoop Catalog、Rest Catalog等多种元数据存储方式。


### 生产实践

- [腾讯 Flink + Iceberg，百亿级实时数据入湖实战](https://flink-learning.org.cn/article/detail/574b5f4618255552ecacb24c7c1ce8e8)
- [数据湖Iceberg技术在小米的落地与应用场景](https://www.dtstack.com/bbs/article/920)
- [汽车之家：基于 Flink + Iceberg 的湖仓一体架构实践](https://flink-learning.org.cn/article/detail/8e580d78309ef019315f93f5de0802de)


## Paimon

Paimon也是一种表格式，但更倾向于实时流处理的数据湖。它在实时场景下更优秀，同时借鉴了很多Iceberg，Hudi的优秀设计(Branch, Tag, Compact)。

有关paimon的历史，用Iceberg做实时湖仓会遇到哪些问题，paimon在流场景下改进如何改进设计，解决了哪些问题等等介绍，都可以在下面Paimon PMC李劲松撰写的文章中了解:

[当流计算邂逅数据湖：Paimon 的前生今世](https://zhuanlan.zhihu.com/p/646325692)


### 生产实践

- [Flink基于Paimon的实时湖仓解决方案的演进](https://flink-learning.org.cn/article/detail/8c890409a3ce4e730adbd424e66fd92b?name=article&tab=suoyou&page=1)

- [小米基于 Apache Paimon 的流式湖仓实践](https://flink-learning.org.cn/article/detail/9bed44cba49baafb6eb2c60b128cbd0f?spm=a2csy.flink.0.0.2799791emq2uKc&name=article&tab=suoyou&page=1)


## Fluss

Fluss刚刚于2024年底Flink Forward Asia上开源，现在市面上资料比较少，也没有生产实践。选几篇有价值的介绍：

- Flink PMC 伍翀 [Fluss：面向实时分析设计的下一代流存储](https://flink-learning.org.cn/article/detail/68f39bcc6623723e17434eae3fedd741)
- 罗宇侠 [流存储Fluss：迈向湖流一体架构](https://flink-learning.org.cn/article/detail/776e869cc97ccd41cabadd4ea840f632)
- Yaroslav Tkachenko [Fluss: First Impression](https://flink-learning.org.cn/article/detail/ca0ee543b84422722d55b6f6a993c948)
- [Fluss官方文档](https://alibaba.github.io/fluss-docs/docs/intro/)


## Flink 2.0

### 新特性

+ 云原生存算分离ForSt DB
  + 分布式高性能有状态计算
  + 计算和存储解绑
+ 流批一体
  + 一份数据 + 一份代码+ 一个引擎
+ 流式湖仓
  + Flink + Paimon Integration
    + 宽表拼接: Partial Update、Sink 合并、列式 Compact
    + 维表查询: Lookup Join、Skew Join、Proc-time Temporal Join
    + 流批一体: CDC、Materialized Table

### 资料
- Apache Flink 2.0: Streaming into the Future (FlinkForward/主论坛.pdf 13页 至 44页)
- Flink 2.0 存算分离状态存储 – ForSt DB (FlinkForward/核心技术.pdf 83页 至 107页)

## 小结

流计算与实时湖仓的发展趋势:

- 技术层面：更实时的数据处理与分析，从天级，到分钟级，再到秒级。
- 流式处理：在流式场景下高校的查询与更新数据，提升全链路的数据新鲜度。
- 多引擎兼容: 支持Flink，Spark等多样化引擎，通过数据湖底座灵活扩展，满足复杂计算需求。
- 湖仓一体化：一条链路满足实时离线计算处理，一套湖仓满足不同数据的存储查询。减少维护成本。
- SQL：通过SQL操作简化数据处理流程，降低技术门槛，支持实时分析与混合负载。