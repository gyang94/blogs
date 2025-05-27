import{_ as s,c as n,o as e,ae as p}from"./chunks/framework.Bk39dawk.js";const t="/blogs/assets/file-structure.DjtbfT2N.png",i="/blogs/assets/no-partition.Ck8yTqEI.png",l="/blogs/assets/partition.DwYxvBcO.png",r="/blogs/assets/schema-evolution.GT3c4t2j.png",d="/blogs/assets/partition-evolution.CrcSL8h5.png",k=JSON.parse('{"title":"Iceberg","description":"","frontmatter":{"title":"Iceberg","tags":"Iceberg","outline":"deep"},"headers":[],"relativePath":"notes/iceberg/02-features.md","filePath":"notes/iceberg/02-features.md","lastUpdated":1748358828000}'),c={name:"notes/iceberg/02-features.md"};function h(o,a,u,_,m,b){return e(),n("div",null,a[0]||(a[0]=[p('<h1 id="iceberg-核心特性" tabindex="-1">Iceberg 核心特性 <a class="header-anchor" href="#iceberg-核心特性" aria-label="Permalink to &quot;Iceberg 核心特性&quot;">​</a></h1><h2 id="存储结构" tabindex="-1">存储结构 <a class="header-anchor" href="#存储结构" aria-label="Permalink to &quot;存储结构&quot;">​</a></h2><p><img src="'+t+`" alt=""></p><h3 id="_1-metadata" tabindex="-1">1. metadata <a class="header-anchor" href="#_1-metadata" aria-label="Permalink to &quot;1. metadata&quot;">​</a></h3><p>iceberg写入的时候会产生一个v.metadata.json文件，用来存放这个表结构相关的元数据</p><h3 id="_2-snapshot-快照" tabindex="-1">2. snapshot 快照 <a class="header-anchor" href="#_2-snapshot-快照" aria-label="Permalink to &quot;2. snapshot 快照&quot;">​</a></h3><p>快照代表一张表在某个时刻的状态。每个快照包含该时刻所对应的所有menifest-list,每个manifest-list包含一个或多个manifest-flie,每个manifest-file包含一个或多个data数据，也可以理解为Manifest list文件代表一个快照（snap-开头）。</p><h3 id="_3-manifest-list-清单列表" tabindex="-1">3. manifest list 清单列表 <a class="header-anchor" href="#_3-manifest-list-清单列表" aria-label="Permalink to &quot;3. manifest list 清单列表&quot;">​</a></h3><p>manifest list主要存储了存储的是Manifest file列表，每行数据存储了Manifest file的路径、data files分区范围，增加了几个数文件、删除了几个数据文件等信息，用来在查询时提供过滤，加快速度。</p><p>例如：snap-6713817133986968147-1-b45e11ce-ee5c-41c6-9b9a-29937b21c9d6.avro</p><h3 id="_4-data-file" tabindex="-1">4. data file <a class="header-anchor" href="#_4-data-file" aria-label="Permalink to &quot;4. data file&quot;">​</a></h3><p>data就是真正存储我们表数据的，iceberg支持的表格式有parquet、avro、orc三种格式。</p><h2 id="catalogs" tabindex="-1">Catalogs <a class="header-anchor" href="#catalogs" aria-label="Permalink to &quot;Catalogs&quot;">​</a></h2><p>Iceberg提供了一个 Catalog 接口，该接口要求实现一系列功能，主要是列出现有表、创建表、删除表、检查表是否存在以及重命名表等功能。</p><h3 id="hive-metastore" tabindex="-1">Hive Metastore <a class="header-anchor" href="#hive-metastore" aria-label="Permalink to &quot;Hive Metastore&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spark.sql.catalog.hive_prod = org.apache.iceberg.spark.SparkCatalog</span></span>
<span class="line"><span>spark.sql.catalog.hive_prod.type = hive</span></span>
<span class="line"><span>spark.sql.catalog.hive_prod.uri = thrift://metastore-host:port</span></span></code></pre></div><h3 id="rest" tabindex="-1">REST <a class="header-anchor" href="#rest" aria-label="Permalink to &quot;REST&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spark.sql.catalog.rest_prod = org.apache.iceberg.spark.SparkCatalog</span></span>
<span class="line"><span>spark.sql.catalog.rest_prod.type = rest</span></span>
<span class="line"><span>spark.sql.catalog.rest_prod.uri = http://localhost:8080</span></span></code></pre></div><h3 id="hadoop" tabindex="-1">Hadoop <a class="header-anchor" href="#hadoop" aria-label="Permalink to &quot;Hadoop&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spark.sql.catalog.hadoop_prod = org.apache.iceberg.spark.SparkCatalog</span></span>
<span class="line"><span>spark.sql.catalog.hadoop_prod.type = hadoop</span></span>
<span class="line"><span>spark.sql.catalog.hadoop_prod.warehouse = hdfs://nn:8020/warehouse/path</span></span></code></pre></div><p>无论是哪种形式的Catalog，其背后就是存储在数据库（mysql）、hdfs、s3等介质，使其具备数据湖表元数据的管理能力。</p><h2 id="format-version" tabindex="-1">format-version <a class="header-anchor" href="#format-version" aria-label="Permalink to &quot;format-version&quot;">​</a></h2><h3 id="v1-基础分析表" tabindex="-1">v1：基础分析表 <a class="header-anchor" href="#v1-基础分析表" aria-label="Permalink to &quot;v1：基础分析表&quot;">​</a></h3><ul><li>定位：面向不可变文件的静态分析表（如数仓场景）。</li><li>支持文件格式：Parquet、Avro、ORC。</li><li>特性： <ul><li>数据文件不可修改，仅支持追加写入。</li><li>元数据通过快照（Snapshot）管理，实现时间旅行（Time Travel）和版本回滚。</li></ul></li><li>兼容性：升级到版本 2 后，所有版本 1 的数据和元文件仍有效（新版读取时会自动补全缺失字段）。</li></ul><h3 id="v2-行级删除" tabindex="-1">v2：行级删除 <a class="header-anchor" href="#v2-行级删除" aria-label="Permalink to &quot;v2：行级删除&quot;">​</a></h3><ul><li>核心改进：支持对不可变文件的细粒度修改。</li><li>关键特性： <ul><li>删除文件（Delete Files）：通过独立的删除文件标记需删除的行（如通过 DELETE 语句删除某行），无需重写原数据文件。</li><li>更新严格性：对写入操作要求更严格（如字段类型强制校验），确保数据一致性。</li></ul></li><li>适用场景：需要局部更新或删除记录的 OLAP 场景（如 GDPR 数据删除需求）。</li></ul><h3 id="v3-开发中" tabindex="-1">v3（开发中） <a class="header-anchor" href="#v3-开发中" aria-label="Permalink to &quot;v3（开发中）&quot;">​</a></h3><ul><li>新增能力： <ul><li>数据类型扩展： <ul><li>纳秒级时间戳（timestamp(tz)）。</li><li>支持 unknown 类型（表示未知或未定义类型）。</li></ul></li><li>列默认值：为新增列定义默认值，简化 Schema 演化。</li><li>高级分区与排序：支持多参数分区函数（如 bucket(user_id, 128)）。</li><li>行级血缘追踪：记录行的来源（如数据血缘治理）。</li><li>二进制删除向量：优化删除标记的存储效率（替代版本 2 的删除文件）。</li></ul></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>通过 format.version 参数可指定表的格式版本（如建表时指定 &#39;format-version&#39;=&#39;2&#39;），需根据业务需求权衡功能与兼容性。</span></span></code></pre></div><h2 id="schemas" tabindex="-1">Schemas <a class="header-anchor" href="#schemas" aria-label="Permalink to &quot;Schemas&quot;">​</a></h2><p>v1.metadata.json对应的json文件中会有与之对应的schems数据的字段（id、name、requered、type）。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  &quot;schemas&quot; : [ {</span></span>
<span class="line"><span>    &quot;type&quot; : &quot;struct&quot;,</span></span>
<span class="line"><span>    &quot;schema-id&quot; : 0,</span></span>
<span class="line"><span>    &quot;fields&quot; : [ {</span></span>
<span class="line"><span>      &quot;id&quot; : 1,</span></span>
<span class="line"><span>      &quot;name&quot; : &quot;id&quot;,</span></span>
<span class="line"><span>      &quot;required&quot; : false,</span></span>
<span class="line"><span>      &quot;type&quot; : &quot;long&quot;</span></span>
<span class="line"><span>    }, {</span></span>
<span class="line"><span>      &quot;id&quot; : 2,</span></span>
<span class="line"><span>      &quot;name&quot; : &quot;name&quot;,</span></span>
<span class="line"><span>      &quot;required&quot; : false,</span></span>
<span class="line"><span>      &quot;type&quot; : &quot;string&quot;</span></span>
<span class="line"><span>    }, {</span></span>
<span class="line"><span>      &quot;id&quot; : 3,</span></span>
<span class="line"><span>      &quot;name&quot; : &quot;dt&quot;,</span></span>
<span class="line"><span>      &quot;required&quot; : false,</span></span>
<span class="line"><span>      &quot;type&quot; : &quot;string&quot;</span></span>
<span class="line"><span>    } ]</span></span>
<span class="line"><span>  } ],</span></span></code></pre></div><h2 id="partitioning-分区" tabindex="-1">Partitioning 分区 <a class="header-anchor" href="#partitioning-分区" aria-label="Permalink to &quot;Partitioning 分区&quot;">​</a></h2><h3 id="分区概念" tabindex="-1">分区概念 <a class="header-anchor" href="#分区概念" aria-label="Permalink to &quot;分区概念&quot;">​</a></h3><p>分区：核心是将数据按照特定规则（如相同日期、类别的记录）物理存储在一起（文件夹 dt=20250213），减少查询时扫描的数据量，提升性能。是通过数据存储优化来提升查询性能的一种技术. 总结：减少查询的数据量，提高性能。</p><h3 id="分区的作用" tabindex="-1">分区的作用 <a class="header-anchor" href="#分区的作用" aria-label="Permalink to &quot;分区的作用&quot;">​</a></h3><ul><li>加速查询：通过将数据按查询条件的关键字段（如日期、地区）分区，查询时仅扫描相关分区，避免全表扫描。</li><li>降低I/O开销：减少磁盘读取量，提升处理效率。</li></ul><h3 id="非分区表-全文件扫描" tabindex="-1">非分区表：全文件扫描 <a class="header-anchor" href="#非分区表-全文件扫描" aria-label="Permalink to &quot;非分区表：全文件扫描&quot;">​</a></h3><p><img src="`+i+'" alt=""></p><ul><li>存储方式：所有数据文件混杂在一个目录中，没有逻辑分组。</li><li>查询过程：</li><li>-- SELECT * FROM t_user_nopart WHERE dt = &#39;20231001&#39;; <ul><li>执行引擎需要扫描所有数据文件，逐行检查dt字段是否符合条件。</li><li>即使目标数据仅占1%，仍需读取全部数据，I/O开销极大。</li></ul></li></ul><h3 id="分区表-精准定位分区" tabindex="-1">分区表：精准定位分区 <a class="header-anchor" href="#分区表-精准定位分区" aria-label="Permalink to &quot;分区表：精准定位分区&quot;">​</a></h3><p><img src="'+l+`" alt=""></p><ul><li>存储方式：数据按分区键（如dt）的值组织成独立目录，每个目录对应一个分区值。</li><li>查询过程：</li><li>-- SELECT * FROM t_user_nopart WHERE dt = &#39;20251209&#39;; <ul><li>执行引擎先查询元数据，直接定位到目录dt=2023-10-01/。</li><li>仅扫描该目录下的文件，跳过其他所有分区数据。</li><li>假设数据按天均匀分布，I/O开销降低至原来的1/N（N为总天数）。</li></ul></li></ul><h2 id="hive-分区" tabindex="-1">Hive 分区 <a class="header-anchor" href="#hive-分区" aria-label="Permalink to &quot;Hive 分区&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>drop table user_table;</span></span>
<span class="line"><span>CREATE TABLE user_table (</span></span>
<span class="line"><span>    id INT,</span></span>
<span class="line"><span>    name STRING,</span></span>
<span class="line"><span>    ts TIMESTAMP</span></span>
<span class="line"><span>) PARTITIONED BY (dt String) STORED AS PARQUET;</span></span>
<span class="line"><span> insert into user_table  partition(dt=&#39;20250213&#39;) select 1,&#39;flink&#39;,current_timestamp();</span></span>
<span class="line"><span>  insert into user_table  select 1,&#39;flink&#39;,current_timestamp();</span></span>
<span class="line"><span>  select * from user_table where dt = &#39;20250213&#39; ;</span></span></code></pre></div><h3 id="hive-分区的局限性" tabindex="-1">Hive 分区的局限性 <a class="header-anchor" href="#hive-分区的局限性" aria-label="Permalink to &quot;Hive 分区的局限性&quot;">​</a></h3><p>显式分区维护</p><ul><li>用户需手动管理分区列</li><li>查询依赖分区列</li><li>查询耦合物理布局： 查询逻辑必须显式依赖分区列，若分区策略变更（如从按天改为按月），需重写所有历史查询。</li><li>运维成本高： 分区列爆炸性增长（如按秒分区）会导致元数据膨胀，小文件问题加剧。</li></ul><h2 id="iceberg隐藏分区" tabindex="-1">Iceberg隐藏分区 <a class="header-anchor" href="#iceberg隐藏分区" aria-label="Permalink to &quot;Iceberg隐藏分区&quot;">​</a></h2><p>Apache Iceberg 的 隐藏分区 是一种革新性的设计，通过 逻辑与物理分离 解决了传统分区（如 Hive 分区）的痛点，分区列维护成本高、分区策略无法灵活变更等问题。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>set spark.sql.catalog.ice_spark_hdfs = org.apache.iceberg.spark.SparkCatalog;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.type = hadoop;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_spark_hdfs;</span></span>
<span class="line"><span>-- 创建表时定义隐藏分区（按天分区）</span></span>
<span class="line"><span>CREATE TABLE ice_spark_hdfs.mj.t_user_part_hidden (</span></span>
<span class="line"><span>     id bigint,</span></span>
<span class="line"><span>     name String,</span></span>
<span class="line"><span>     ts timestamp,</span></span>
<span class="line"><span>    dt string</span></span>
<span class="line"><span>) USING iceberg</span></span>
<span class="line"><span>PARTITIONED BY (days(ts), bucket(3, id));  </span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(1,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;),</span></span>
<span class="line"><span>(2,&#39;flink&#39;,current_timestamp(),&#39;20250210&#39;),</span></span>
<span class="line"><span>(1,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;),</span></span>
<span class="line"><span>(2,&#39;flink&#39;,current_timestamp(),&#39;20250210&#39;),</span></span>
<span class="line"><span>(3,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;);</span></span></code></pre></div><h3 id="隐藏分区的核心机制" tabindex="-1">隐藏分区的核心机制 <a class="header-anchor" href="#隐藏分区的核心机制" aria-label="Permalink to &quot;隐藏分区的核心机制&quot;">​</a></h3><h4 id="_1-自动分区值的转换" tabindex="-1">1. 自动分区值的转换 <a class="header-anchor" href="#_1-自动分区值的转换" aria-label="Permalink to &quot;1. 自动分区值的转换&quot;">​</a></h4><ul><li>功能：通过预定义的 分区转换函数（如 days(), hours(), bucket()），Iceberg 自动将字段值转换为分区值。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>PARTITIONED BY (days(ts ))  -- 按天分区</span></span>
<span class="line"><span>PARTITIONED BY (bucket(10, user_id))  -- 按 user_id 分10个桶</span></span>
<span class="line"><span>PARTITIONED BY (truncate(10, url))    -- 截取url前10字符分区</span></span></code></pre></div><ul><li>优势：用户无需手动维护 ts 等冗余字段，避免数据不一致。</li></ul><h4 id="_2-查询透明性" tabindex="-1">2. 查询透明性 <a class="header-anchor" href="#_2-查询透明性" aria-label="Permalink to &quot;2. 查询透明性&quot;">​</a></h4><ul><li>查询透明性：用户只需按原始字段过滤，Iceberg 自动定位到对应物理文件。 用户直接查询 ts ，无需知道分区逻辑</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden WHERE ts BETWEEN &#39;2023-10-01 00:00:00&#39; AND &#39;2025-10-01 23:59:59&#39;;</span></span></code></pre></div><h4 id="_3-分区策略动态演化" tabindex="-1">3. 分区策略动态演化 <a class="header-anchor" href="#_3-分区策略动态演化" aria-label="Permalink to &quot;3. 分区策略动态演化&quot;">​</a></h4><ul><li>问题：传统分区表一旦分区策略不合理（如按“月”分区导致大文件），需全量数据重写。</li><li>Iceberg 解决方案： 通过 ALTER TABLE 修改分区策略，后续新数据按新策略写入，旧数据保持原状，无需迁移。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden REPLACE PARTITION FIELD ts_day WITH months(ts) as month;</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(4,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden DROP PARTITION FIELD bucket(3, id);</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden REPLACE PARTITION FIELD  month WITH months(ts) as month1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(7,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;);</span></span></code></pre></div><h3 id="隐藏分区分区转换函数" tabindex="-1">隐藏分区分区转换函数 <a class="header-anchor" href="#隐藏分区分区转换函数" aria-label="Permalink to &quot;隐藏分区分区转换函数&quot;">​</a></h3><p>Iceberg 支持多种内置转换函数，将字段值映射到分区值：</p><table tabindex="0"><thead><tr><th>函数</th><th>说明</th><th>示例</th></tr></thead><tbody><tr><td>identity</td><td>直接使用字段值（传统分区方式）</td><td>PARTITIONED BY (identity(level))</td></tr><tr><td>year, month, day</td><td>按时间粒度分区</td><td>PARTITIONED BY (days(event_time))</td></tr><tr><td>hour</td><td>按小时分区</td><td>PARTITIONED BY (hour(event_time))</td></tr><tr><td>bucket</td><td>哈希分桶（类似分桶表）</td><td>PARTITIONED BY (bucket(100, user_id))</td></tr><tr><td>truncate</td><td>截断字符串或数字（如按前缀分区）</td><td>PARTITIONED BY (truncate(10, url))</td></tr></tbody></table><h3 id="隐藏分区与传统分区的性能对比" tabindex="-1">隐藏分区与传统分区的性能对比 <a class="header-anchor" href="#隐藏分区与传统分区的性能对比" aria-label="Permalink to &quot;隐藏分区与传统分区的性能对比&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>传统分区（Hive）</th><th>Iceberg 隐藏分区</th></tr></thead><tbody><tr><td>分区维护</td><td>需手动维护分区列</td><td>全自动，无额外字段</td></tr><tr><td>查询优化</td><td>依赖用户显式指定分区键</td><td>自动应用分区过滤，透明加速</td></tr><tr><td>分区演化</td><td>需重写全表数据</td><td>动态修改策略，无需迁移旧数据</td></tr><tr><td>小文件问题</td><td>分区过多易产生小文件</td><td>结合元数据优化，减少小文件影响</td></tr></tbody></table><h2 id="evolution-演化" tabindex="-1">Evolution 演化 <a class="header-anchor" href="#evolution-演化" aria-label="Permalink to &quot;Evolution 演化&quot;">​</a></h2><p>Iceberg 的 表进化 机制</p><p>在不重写数据或迁移表的情况下，动态调整表结构（Schema）、分区策略（Partitioning）和排序规则（Sort Order）。降低了运维复杂度，同时保证数据一致性和查询兼容性。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spark-sql --hiveconf hive.cli.print.header=true</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs = org.apache.iceberg.spark.SparkCatalog;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.type = hadoop;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_spark_hdfs;</span></span>
<span class="line"><span>use ice_spark_hdfs;</span></span>
<span class="line"><span>create database if not exists ice_spark_hdfs.mj;</span></span>
<span class="line"><span>drop table if exists ice_spark_hdfs.mj.t_user;</span></span>
<span class="line"><span>CREATE TABLE ice_spark_hdfs.mj.t_user (</span></span>
<span class="line"><span>    id bigint,</span></span>
<span class="line"><span>    dt string)</span></span>
<span class="line"><span>USING iceberg </span></span>
<span class="line"><span>PARTITIONED BY (dt)</span></span>
<span class="line"><span>TBLPROPERTIES (&#39;format-version&#39;=&#39;2&#39;);</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user values</span></span>
<span class="line"><span>(4,&#39;20250209&#39;),</span></span>
<span class="line"><span>(5,&#39;20250209&#39;),</span></span>
<span class="line"><span>(6,&#39;20250209&#39;);</span></span></code></pre></div><h3 id="hive局限性引出问题" tabindex="-1">Hive局限性引出问题 <a class="header-anchor" href="#hive局限性引出问题" aria-label="Permalink to &quot;Hive局限性引出问题&quot;">​</a></h3><p>假如Hive中，如果把一个按天分区的表，改成按小时分区，如何实现？</p><ul><li>创建一张小时分区的表（hive不能直接修改原表）。</li><li>数据Insert到新的小时分区表。</li><li>Rename的命令把新表的名字改为原表。</li><li>使用按照天分区的原表的上的脚本修改成按照小时分区的sql脚本（dt、hour）。</li></ul><h3 id="schema-evolution" tabindex="-1">Schema Evolution <a class="header-anchor" href="#schema-evolution" aria-label="Permalink to &quot;Schema Evolution&quot;">​</a></h3><p>核心能力：动态修改表结构（如增删改列、调整嵌套字段顺序），无需重写数据文件。</p><h4 id="_1-支持的变更类型" tabindex="-1">1. 支持的变更类型 <a class="header-anchor" href="#_1-支持的变更类型" aria-label="Permalink to &quot;1. 支持的变更类型&quot;">​</a></h4><table tabindex="0"><thead><tr><th>操作</th><th>说明</th><th>示例</th></tr></thead><tbody><tr><td>Add</td><td>添加新列或嵌套字段</td><td>新增 user_geo 列记录地理位置</td></tr><tr><td>Drop</td><td>删除现有列或嵌套字段</td><td>弃用旧字段 legacy_id</td></tr><tr><td>Rename</td><td>重命名列或嵌套字段</td><td>将 cust_id 更名为 customer_id</td></tr><tr><td>Update</td><td>扩展字段类型（如 INT → BIGINT）</td><td>将 price 字段从 FLOAT 改为 DOUBLE</td></tr></tbody></table><h4 id="_2-实现原理" tabindex="-1">2.实现原理 <a class="header-anchor" href="#_2-实现原理" aria-label="Permalink to &quot;2.实现原理&quot;">​</a></h4><ul><li>唯一列标识符（Column ID）： Iceberg 为每个列分配唯一 ID，而非依赖列名或位置。重命名或调整顺序时，ID 保持不变，确保数据正确性。</li><li>元数据层管理： Schema 变更仅修改元数据（如 metadata.json），数据文件无需重写。读取时通过 ID 映射新旧列名。</li></ul><p>模式演化：其底层原理就是对元数据进行修改，查询数据的时候时候基于元数据找到对应的数据。请注意，映射键不支持添加或删除会更改相等性的结构字段。</p><h4 id="_3-示例" tabindex="-1">3.示例 <a class="header-anchor" href="#_3-示例" aria-label="Permalink to &quot;3.示例&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- 添加column</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user   ADD COLUMN age int;</span></span>
<span class="line"><span>--指定列后面更加column</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user ADD COLUMN sex int AFTER id;</span></span>
<span class="line"><span>--修改列名</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user RENAME COLUMN sex TO sex1;</span></span>
<span class="line"><span>--修改列类型</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user ALTER COLUMN sex1 TYPE bigint;</span></span>
<span class="line"><span>--添加注释</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user ALTER COLUMN sex1 COMMENT &#39;table sex&#39;;</span></span>
<span class="line"><span>--删除列</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user DROP COLUMN sex1;</span></span></code></pre></div><p>更改metadata.json里的schema结构，column是根据id来识别。 <img src="`+r+`" alt=""></p><h3 id="partition-evolution" tabindex="-1">Partition Evolution <a class="header-anchor" href="#partition-evolution" aria-label="Permalink to &quot;Partition Evolution&quot;">​</a></h3><p>核心能力：动态调整分区策略，新旧分区布局共存，查询自动适配。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>--修改分区·</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user REPLACE PARTITION FIELD dt WITH id;</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user values(7,&#39;20250209&#39;,1);</span></span></code></pre></div><p><img src="`+d+`" alt=""> 老分区的路径依然存在，新数据存在新的分区中</p><p>传统系统（如 Hive）的局限性</p><ul><li>分区策略绑定表定义，变更需创建新表并迁移数据。</li><li>查询必须显示指定分区列，调整策略需重写所有查询。</li></ul><p>Iceberg 实现机制</p><ul><li>多版本分区策略： 新数据按新策略分区，旧数据保留原分区布局，元数据记录所有历史分区规则。</li><li>自动分区剪枝： 查询时根据过滤条件自动选择对应分区布局，无需用户干预。</li></ul><p>与传统系统的对比总结</p><table tabindex="0"><thead><tr><th>维度</th><th>Hive</th><th>Iceberg</th></tr></thead><tbody><tr><td>Schema 变更</td><td>部分支持，需重写数据或迁移表</td><td>完全支持，元数据级操作，无需重写数据</td></tr><tr><td>分区策略调整</td><td>需创建新表，查询需重写</td><td>动态演进，新旧分区共存，查询自动适配</td></tr><tr><td>排序规则调整</td><td>不支持</td><td>动态调整，新旧排序共存</td></tr><tr><td>运维成本</td><td>高（需数据迁移与查询适配）</td><td>低（纯元数据操作）</td></tr></tbody></table><h2 id="分支-branching-和标签-tagging" tabindex="-1">分支(Branching)和标签(Tagging) <a class="header-anchor" href="#分支-branching-和标签-tagging" aria-label="Permalink to &quot;分支(Branching)和标签(Tagging)&quot;">​</a></h2><p>Iceberg 分支（Branch）和标签（Tag）功能 提供了灵活的快照管理和版本控制能力。支持多版本并行开发满足历史数据审计和合规性管理等应用场景。</p><table tabindex="0"><thead><tr><th>概念</th><th>定义</th><th>生命周期管理</th></tr></thead><tbody><tr><td>分支（Branch）</td><td>指向快照的可变引用，用于创建独立的开发或测试（如 audit-branch）。</td><td>可设置保留策略：保留最近 N 个快照，或保留指定时长的快照（如 7 天）。</td></tr><tr><td>标签（Tag）</td><td>指向快照的不可变引用，用于标记关键历史节点（如 EOY-2023 表示年终快照）。</td><td>默认永久保留，可设置过期时间（如 180 天）。</td></tr><tr><td>快照（Snapshot）</td><td>表在某一时刻的完整状态，包含数据文件列表、Schema、分区信息等元数据。</td><td>通过 expire_snapshots 清理过期快照，释放存储空间。</td></tr></tbody></table><p>应用场景</p><ul><li>历史数据审计与合规性管理 通过标签（Tag）标记关键历史快照（如月末、年末数据），并设置保留策略，满足审计或合规要求。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>eg:合规要求数据隐私（用户敏感信息加密）则可以通过审计发现敏感信息是否加密。</span></span>
<span class="line"><span>iceberg实现：每月或每季度创建Tag，审计部门周期性检查（如季度审计、月度审计）来满足合规要求。</span></span></code></pre></div><ul><li>数据验证与测试 使用分支（Branch）隔离测试环境，验证数据变更或新功能，避免影响主表稳定性。</li><li>版本管理和回滚 标签用于标记稳定版本（如发布版本），分支支持版本回滚或数据修复。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>数据审计：是对数据的系统性检查和评估，旨在验证数据的准确性、完整性、一致性和安全性，并评估数据处理流程是否符合既定标准或法规。</span></span>
<span class="line"><span>合规：指组织在数据处理活动中遵守相关法律法规、行业标准及内部政策的要求，避免法律风险和经济损失。</span></span></code></pre></div><p>1.场景描述：</p><p>通过标签（Tag）标记关键历史快照（如月末、年末数据），并设置保留策略，满足审计或合规要求（如 GDPR）。例如：</p><ul><li>每周快照保留：标记每周数据并保留 7 天。</li><li>年度快照永久保留：标记年末快照作为长期审计依据。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//默认最新快照构建Tag</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE TAG  \`year-1\` RETAIN 7 DAYS; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>//指定快照创建Tag</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE TAG  \`year-2\` AS OF VERSION 5868249554383675426 RETAIN 7 DAYS;</span></span>
<span class="line"><span></span></span>
<span class="line"><span> //修改Tag保留时间</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden REPLACE TAG \`year-1\` RETAIN 30 DAYS;</span></span>
<span class="line"><span>//查询指定标签</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;year-1&#39;;</span></span>
<span class="line"><span>//删除Tag</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden DROP TAG \`year-2\`;</span></span></code></pre></div><ul><li>优势： 标签独立于主分支生命周期，确保关键快照不被自动清理，同时通过时间旅行查询回溯历史状态。</li></ul><p>2.场景描述：</p><p>使用分支（Branch）隔离测试环境，验证数据变更或新功能，避免影响主表稳定性。例如：</p><ul><li>审计分支：在独立分支写入数据，验证通过后合并到主分支。</li><li>实验性开发：开发团队在分支上测试 Schema 变更或数据更新。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>//创建分支</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE BRANCH \`br1\`;</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE BRANCH \`br2\`;</span></span>
<span class="line"><span>//查询分支</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;br1&#39;;</span></span>
<span class="line"><span>//删除分支</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden DROP BRANCH \`br2\`;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//修改分支合并到主分支</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden SET TBLPROPERTIES (&#39;write.wap.enabled&#39;=&#39;true&#39;);  </span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 修改分支</span></span>
<span class="line"><span>SET spark.wap.branch = br1;</span></span>
<span class="line"><span>update ice_spark_hdfs.mj.t_user_part_hidden set name = &#39;qqq&#39;;</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(4,&#39;123&#39;,current_timestamp(),&#39;20250209&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//查询分支，数据已被改动，name = &#39;qqq&#39;</span></span>
<span class="line"><span>select * from ice_spark_hdfs.mj.t_user_part_hidden;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 切换到主分支，查询数据，数据没有改动</span></span>
<span class="line"><span>SET spark.wap.branch = main;</span></span>
<span class="line"><span>select * from ice_spark_hdfs.mj.t_user_part_hidden;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// fastforward主分支，再查询主分支，数据已经改动</span></span>
<span class="line"><span>CALL ice_spark_hdfs.system.fast_forward(&#39;mj.t_user_part_hidden &#39;, &#39;main&#39;, &#39;br1&#39;);</span></span></code></pre></div><h2 id="time-travel-时间旅行" tabindex="-1">Time Travel 时间旅行 <a class="header-anchor" href="#time-travel-时间旅行" aria-label="Permalink to &quot;Time Travel 时间旅行&quot;">​</a></h2><p>Iceberg 的 时间旅行 功能允许用户查询表在 特定时间点 或 特定版本 的历史数据快照，无需手动备份或迁移数据。该功能在数据审计、错误数据修复、历史分析等场景中至关重要。</p><ol><li>时间旅行的核心能力</li></ol><ul><li>按时间戳查询：指定具体时间（如 &#39;2023-10-01 10:00:00&#39;），查询该时刻的数据状态。</li><li>按快照ID查询：通过唯一快照 ID（如 10963874102873）定位数据版本。</li><li>按分支/标签查询：使用分支（Branch）或标签（Tag）名称访问特定数据分支或标记版本。</li></ul><ol start="2"><li>时间旅行语法详解</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- time travel to October 26, 1986 at 01:21:00</span></span>
<span class="line"><span>SELECT * FROM  ice_spark_hdfs.mj.t_user_part_hidden TIMESTAMP AS OF &#39;2025-02-15 00:39:01.33&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- time travel to snapshot with id 10963874102873L</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF 5868249554383675426 ;</span></span>
<span class="line"><span>-- 按分支或标签查询（字符串）</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;br1&#39;;</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;year-1&#39;;</span></span></code></pre></div><ol start="3"><li>元数据查询</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 查询表快照</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden.snapshots;</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>// 查询数据文件信息</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden.files;</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>// 查询表历史</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden.history;</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>// 查询 manifest</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden.manifests;</span></span></code></pre></div><h3 id="案例" tabindex="-1">案例 <a class="header-anchor" href="#案例" aria-label="Permalink to &quot;案例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>hadoop fs -rmr hdfs://mj01:8020/lakehouse/ice_spark_hdfs</span></span>
<span class="line"><span>spark-sql --hiveconf hive.cli.print.header=true</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs = org.apache.iceberg.spark.SparkCatalog;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.type = hadoop;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_spark_hdfs;</span></span>
<span class="line"><span>use ice_spark_hdfs;</span></span>
<span class="line"><span>create database if not exists ice_spark_hdfs.mj;</span></span>
<span class="line"><span>drop table if exists ice_spark_hdfs.mj.t_user;</span></span>
<span class="line"><span>CREATE TABLE ice_spark_hdfs.mj.t_user (</span></span>
<span class="line"><span>    id bigint,</span></span>
<span class="line"><span>    dt string)</span></span>
<span class="line"><span>USING iceberg </span></span>
<span class="line"><span>PARTITIONED BY (dt)</span></span>
<span class="line"><span>TBLPROPERTIES (&#39;format-version&#39;=&#39;2&#39;);</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user values</span></span>
<span class="line"><span>(4,&#39;20250209&#39;),</span></span>
<span class="line"><span>(5,&#39;20250209&#39;),</span></span>
<span class="line"><span>(6,&#39;20250209&#39;);</span></span>
<span class="line"><span>======================================================</span></span>
<span class="line"><span>hadoop fs -rmr hdfs://mj01:8020/lakehouse/ice_spark_hdfs</span></span>
<span class="line"><span>spark-sql --hiveconf hive.cli.print.header=true</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs = org.apache.iceberg.spark.SparkCatalog;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.type = hadoop;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_spark_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_spark_hdfs;</span></span>
<span class="line"><span>CREATE TABLE ice_spark_hdfs.mj.t_user_part_hidden (</span></span>
<span class="line"><span>     id bigint,</span></span>
<span class="line"><span>     name String,</span></span>
<span class="line"><span>     ts timestamp,</span></span>
<span class="line"><span>    dt string</span></span>
<span class="line"><span>) USING iceberg</span></span>
<span class="line"><span>PARTITIONED BY (days(ts), bucket(3, id));  </span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(1,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;),</span></span>
<span class="line"><span>(2,&#39;flink&#39;,current_timestamp(),&#39;20250210&#39;),</span></span>
<span class="line"><span>(1,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;),</span></span>
<span class="line"><span>(2,&#39;flink&#39;,current_timestamp(),&#39;20250210&#39;),</span></span>
<span class="line"><span>(3,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE TAG  \`year-1\` AS OF VERSION 747233321920288435;</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE TAG  \`year-2\` ; </span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE TAG  \`year-3\` RETAIN 60 DAYS; </span></span>
<span class="line"><span>ALTER TABLEice_spark_hdfs.mj.t_user_part_hidden REPLACE TAG \`year-1\`</span></span>
<span class="line"><span>AS OF VERSION 747233321920288435 RETAIN 60 DAYS;</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(4,&#39;flink&#39;,current_timestamp(),&#39;20250209&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;year-1&#39;;</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden DROP TAG \`year-1\`;</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE BRANCH \`br1\`;</span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden CREATE BRANCH \`br2\`;</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;br1&#39;;</span></span>
<span class="line"><span>SELECT * FROM ice_spark_hdfs.mj.t_user_part_hidden VERSION AS OF &#39;br2&#39;;</span></span>
<span class="line"><span>update ice_spark_hdfs.mj.t_user_part_hidden set name=&#39;222&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden DROP BRANCH \`branch-1\`;</span></span>
<span class="line"><span>CALL ice_spark_hdfs.system.fast_forward(&#39;mj.t_user_part_hidden &#39;, &#39;main&#39;, &#39;branch-2&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ALTER TABLE ice_spark_hdfs.mj.t_user_part_hidden SET TBLPROPERTIES (&#39;write.wap.enabled&#39;=&#39;true&#39;);  </span></span>
<span class="line"><span></span></span>
<span class="line"><span>update ice_spark_hdfs.mj.t_user_part_hidden set name = &#39;qqq&#39;;</span></span>
<span class="line"><span>SET spark.wap.branch = br1;</span></span>
<span class="line"><span>INSERT INTO ice_spark_hdfs.mj.t_user_part_hidden  values</span></span>
<span class="line"><span>(4,&#39;123&#39;,current_timestamp(),&#39;20250209&#39;);</span></span>
<span class="line"><span>select * from \`ice_spark_hdfs.mj.t_user_part_hidden\`;</span></span>
<span class="line"><span>SET spark.wap.branch = main;</span></span>
<span class="line"><span>CALL ice_spark_hdfs.system.fast_forward(&#39;mj.t_user_part_hidden &#39;, &#39;main&#39;, &#39;br1&#39;);</span></span></code></pre></div>`,121)]))}const E=s(c,[["render",h]]);export{k as __pageData,E as default};
