import{_ as s,c as n,o as e,ae as p}from"./chunks/framework.Bk39dawk.js";const u=JSON.parse('{"title":"Iceberg","description":"","frontmatter":{"title":"Iceberg","tags":"Iceberg","outline":"deep"},"headers":[],"relativePath":"notes/iceberg/03-flink-integration.md","filePath":"notes/iceberg/03-flink-integration.md","lastUpdated":1748962206000}'),i={name:"notes/iceberg/03-flink-integration.md"};function l(t,a,c,r,o,d){return e(),n("div",null,a[0]||(a[0]=[p(`<h1 id="flink-与-iceberg-集成" tabindex="-1">Flink 与 Iceberg 集成 <a class="header-anchor" href="#flink-与-iceberg-集成" aria-label="Permalink to &quot;Flink 与 Iceberg 集成&quot;">​</a></h1><h2 id="创建-flink-catalog" tabindex="-1">创建 Flink Catalog <a class="header-anchor" href="#创建-flink-catalog" aria-label="Permalink to &quot;创建 Flink Catalog&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>drop table if exists hdfs_t1;</span></span>
<span class="line"><span>CREATE TABLE hdfs_t1 (</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP</span></span>
<span class="line"><span>) WITH (</span></span>
<span class="line"><span>&#39;connector&#39; = &#39;iceberg&#39;,</span></span>
<span class="line"><span>&#39;catalog-name&#39; = &#39;hdfs_prod&#39;, </span></span>
<span class="line"><span>&#39;catalog-database&#39; = &#39;hdfs_db&#39;,</span></span>
<span class="line"><span>&#39;catalog-type&#39; = &#39;hadoop&#39;, -- 指定 Catalog 类型为 Hadoop</span></span>
<span class="line"><span>&#39;warehouse&#39; = &#39;hdfs://mj01:8020/lakehouse&#39;  -- 数据存储路径</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>EXECUTE STATEMENT SET</span></span>
<span class="line"><span>BEGIN </span></span>
<span class="line"><span>INSERT INTO hdfs_t1  values (1,&#39;t2&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>END;</span></span></code></pre></div><h3 id="hadoop-catalog" tabindex="-1">Hadoop Catalog <a class="header-anchor" href="#hadoop-catalog" aria-label="Permalink to &quot;Hadoop Catalog&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE CATALOG ice_hdfs WITH (</span></span>
<span class="line"><span>  &#39;type&#39;=&#39;iceberg&#39;,</span></span>
<span class="line"><span>  &#39;catalog-type&#39;=&#39;hadoop&#39;,</span></span>
<span class="line"><span>  &#39;warehouse&#39;=&#39;hdfs://mj01:8020/lakehouse/ice_hdfs&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>create database if not exists ice_hdfs.mj1;</span></span></code></pre></div><h3 id="hive-catalog" tabindex="-1">Hive Catalog <a class="header-anchor" href="#hive-catalog" aria-label="Permalink to &quot;Hive Catalog&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE CATALOG ice_hive WITH (</span></span>
<span class="line"><span>  &#39;type&#39;=&#39;iceberg&#39;,</span></span>
<span class="line"><span>  &#39;catalog-type&#39;=&#39;hive&#39;,</span></span>
<span class="line"><span>  &#39;uri&#39;=&#39;thrift://mj02:9083&#39;,</span></span>
<span class="line"><span>  &#39;warehouse&#39;=&#39;hdfs://mj01:8020/lakehouse/ice_hive&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>create database if not exists ice_hive.mj1;</span></span></code></pre></div><h2 id="flink-与-iceberg-ddl" tabindex="-1">Flink 与 Iceberg DDL <a class="header-anchor" href="#flink-与-iceberg-ddl" aria-label="Permalink to &quot;Flink 与 Iceberg DDL&quot;">​</a></h2><h3 id="创建表" tabindex="-1">创建表 <a class="header-anchor" href="#创建表" aria-label="Permalink to &quot;创建表&quot;">​</a></h3><h4 id="基础语法" tabindex="-1">基础语法 <a class="header-anchor" href="#基础语法" aria-label="Permalink to &quot;基础语法&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>drop table if exists ice_hdfs.mj1.t1;</span></span>
<span class="line"><span>CREATE TABLE ice_hdfs.mj1.t1(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP,</span></span>
<span class="line"><span>    PRIMARY KEY(id) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）</span></span>
<span class="line"><span>) WITH (</span></span>
<span class="line"><span>  &#39;format-version&#39;=&#39;2&#39;  -- Iceberg 表格式版本</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t1 values (2,&#39;t1&#39;,&#39;20250209&#39;,current_timestamp);</span></span></code></pre></div><h4 id="分区表" tabindex="-1">分区表 <a class="header-anchor" href="#分区表" aria-label="Permalink to &quot;分区表&quot;">​</a></h4><ul><li>Iceberg 支持隐藏分区（如按日期分区），但 Flink 目前不支持在 DDL 中直接使用函数进行分区（如 PARTITIONED BY (days(ts))）。</li><li>如果需要在 Flink 中使用隐藏分区，建议在 Iceberg 表创建后通过 API 或 Spark 实现。</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>drop table if exists ice_hdfs.mj1.t2;</span></span>
<span class="line"><span>CREATE TABLE ice_hdfs.mj1.t2(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP,</span></span>
<span class="line"><span>     PRIMARY KEY(id) NOT ENFORCED  </span></span>
<span class="line"><span>    ) PARTITIONED BY (dt)   WITH (</span></span>
<span class="line"><span>  &#39;format-version&#39;=&#39;2&#39;  -- Iceberg 表格式版本</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t2  values (1,&#39;t2&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>--</span></span>
<span class="line"><span>drop table if exists ice_hdfs.mj1.t3;</span></span>
<span class="line"><span>CREATE TABLE ice_hdfs.mj1.t3(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP,</span></span>
<span class="line"><span>     PRIMARY KEY(id,dt) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）</span></span>
<span class="line"><span>    ) PARTITIONED BY (dt)   WITH (</span></span>
<span class="line"><span>  &#39;format-version&#39;=&#39;2&#39;,  -- Iceberg 表格式版本</span></span>
<span class="line"><span>  &#39;write.upsert.enabled&#39;=&#39;true&#39;  -- 启用 Upsert</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t3   values (1,&#39;t3&#39;,&#39;20250209&#39;,current_timestamp),</span></span>
<span class="line"><span> (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>==========================================</span></span>
<span class="line"><span>drop table if exists ice_hdfs.mj1.t4;</span></span>
<span class="line"><span>CREATE TABLE ice_hdfs.mj1.t4(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP)  </span></span>
<span class="line"><span>PARTITIONED BY (dt,hours(ts),bucket(3, id));</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t4   values (1,&#39;t44&#39;,&#39;20250209&#39;,current_timestamp),</span></span>
<span class="line"><span> (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span></code></pre></div><h4 id="复制表结构-create-table-like" tabindex="-1">复制表结构（CREATE TABLE LIKE） <a class="header-anchor" href="#复制表结构-create-table-like" aria-label="Permalink to &quot;复制表结构（CREATE TABLE LIKE）&quot;">​</a></h4><p>复制表结构、分区及属性</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE ice_hdfs.mj1.t11 LIKE ice_hdfs.mj1.t1;</span></span></code></pre></div><h3 id="修改表" tabindex="-1">修改表 <a class="header-anchor" href="#修改表" aria-label="Permalink to &quot;修改表&quot;">​</a></h3><h4 id="修改表属性" tabindex="-1">修改表属性 <a class="header-anchor" href="#修改表属性" aria-label="Permalink to &quot;修改表属性&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- 修改写入格式</span></span>
<span class="line"><span>ALTER TABLE ice_hdfs.mj1.t11 SET (&#39;write.format.default&#39;=&#39;avro&#39;);  </span></span>
<span class="line"><span>==========</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t11  values (1,&#39;t44&#39;,&#39;20250209&#39;,current_timestamp),</span></span>
<span class="line"><span> (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span></code></pre></div><h4 id="重命名表" tabindex="-1">重命名表 <a class="header-anchor" href="#重命名表" aria-label="Permalink to &quot;重命名表&quot;">​</a></h4><ul><li>Hadoop Catalog不支持修改</li><li>Hive Catalog 支持修改</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ALTER TABLE ice_hdfs.mj1.t11 RENAME TO ice_hdfs.mj1.t111;</span></span>
<span class="line"><span>-----------------------------</span></span>
<span class="line"><span>CREATE TABLE ice_hive.mj1.t1(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP,</span></span>
<span class="line"><span>    PRIMARY KEY(id) NOT ENFORCED  -- 定义主键（UPSERT 模式必需）</span></span>
<span class="line"><span>) WITH (</span></span>
<span class="line"><span>  &#39;format-version&#39;=&#39;2&#39;  -- Iceberg 表格式版本</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>ALTER TABLE ice_hive.mj1.t1 RENAME TO ice_hive.mj1.t112;</span></span></code></pre></div><h3 id="删除表" tabindex="-1">删除表 <a class="header-anchor" href="#删除表" aria-label="Permalink to &quot;删除表&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>DROP TABLE ice_hdfs.mj1.t11;</span></span></code></pre></div><h2 id="flink-与-iceberg-write" tabindex="-1">Flink 与 Iceberg Write <a class="header-anchor" href="#flink-与-iceberg-write" aria-label="Permalink to &quot;Flink 与 Iceberg Write&quot;">​</a></h2><h3 id="追加写入-insert-into" tabindex="-1">追加写入(Insert Into) <a class="header-anchor" href="#追加写入-insert-into" aria-label="Permalink to &quot;追加写入(Insert Into)&quot;">​</a></h3><p>同一个分区保证唯一值（有主键的情况下）。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- t1为主键表无分区，t2为主键表有分区(分区为第三column)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 最终插入三条数据，虽然主键相同，但分区不同。分区不同不保证唯一性。</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t2 values (1,&#39;111&#39;,&#39;111&#39;,current_timestamp),</span></span>
<span class="line"><span>(1,&#39;222&#39;,&#39;222&#39;,current_timestamp),(1,&#39;333&#39;,&#39;333&#39;,current_timestamp);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 最终插入一条数据(数据为333)，无分区，主键相同保证唯一。</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t1 values (1,&#39;111&#39;,&#39;111&#39;,current_timestamp),</span></span>
<span class="line"><span>(1,&#39;222&#39;,&#39;222&#39;,current_timestamp),(1,&#39;333&#39;,&#39;333&#39;,current_timestamp);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 最终插入一条数据(数据为333)，主键和分区都相同</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t2 values (1,&#39;111&#39;,&#39;11a&#39;,current_timestamp),</span></span>
<span class="line"><span>(1,&#39;222&#39;,&#39;11a&#39;,current_timestamp),(1,&#39;333&#39;,&#39;11a&#39;,current_timestamp);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t2 select * from ice_hdfs.mj1.t2 ;</span></span></code></pre></div><h3 id="覆盖写入-insert-overwrite" tabindex="-1">覆盖写入 (Insert Overwrite) <a class="header-anchor" href="#覆盖写入-insert-overwrite" aria-label="Permalink to &quot;覆盖写入 (Insert Overwrite)&quot;">​</a></h3><p>注意：流处理不支持OVERWRITE</p><ol><li>如果表没有分区则全部覆盖</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>INSERT OVERWRITE ice_hdfs.mj1.t1 SELECT 2,&#39;qqqqqq&#39;,&#39;11&#39;,current_timestamp;</span></span></code></pre></div><ol start="2"><li>如果表分区了，插入时指定了dt=&#39;xxx&#39;、则覆盖对应的分区</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>INSERT OVERWRITE ice_hdfs.mj1.t2 PARTITION(dt=&#39;333&#39;) SELECT 2,&#39;11bbbbb&#39;,current_timestamp;</span></span></code></pre></div><ol start="3"><li>如果表分区了，插入时不指定dt=&#39;xxx&#39;、则动态匹配对应的分区</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>INSERT OVERWRITE ice_hdfs.mj1.t2 SELECT 1,&#39;qqqqqq&#39;,&#39;333&#39;,current_timestamp union  SELECT 1,&#39;qqqqqq&#39;,&#39;222&#39;,current_timestamp;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INSERT OVERWRITE ice_hdfs.mj1.t2 SELECT 2,&#39;qqqqqq&#39;,&#39;333&#39;,current_timestamp union  SELECT 2,&#39;qqqqqq&#39;,&#39;222&#39;,current_timestamp;</span></span></code></pre></div><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;batch&#39;;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span></code></pre></div><h3 id="upsert" tabindex="-1">Upsert <a class="header-anchor" href="#upsert" aria-label="Permalink to &quot;Upsert&quot;">​</a></h3><p>Iceberg在将数据写入v2表格式时支持基于主键的UPSERT。</p><ul><li>创表的时候指定 &#39;write.upsert.enabled&#39;=&#39;true&#39;</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>INSERT INTO ice_hdfs.mj1.t3  values (1,&#39;t3&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t3  values (1,&#39;t5&#39;,&#39;20250209&#39;,current_timestamp);</span></span></code></pre></div><ul><li>Insert into的时候指定 &#39;upsert-enabled&#39;=&#39;true&#39;</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>INSERT INTO ice_hdfs.mj1.t1  values (1,&#39;t3&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t1  values (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t1 /*+ OPTIONS(&#39;upsert-enabled&#39;=&#39;true&#39;) */ values (1,&#39;t5&#39;,&#39;20250209&#39;,current_timestamp);</span></span></code></pre></div><h2 id="flink与iceberg-query" tabindex="-1">Flink与Iceberg Query <a class="header-anchor" href="#flink与iceberg-query" aria-label="Permalink to &quot;Flink与Iceberg Query&quot;">​</a></h2><h3 id="核心特性" tabindex="-1">核心特性 <a class="header-anchor" href="#核心特性" aria-label="Permalink to &quot;核心特性&quot;">​</a></h3><ol><li>双模式支持</li></ol><ul><li>支持 流式（Streaming） 和 批处理（Batch） 读取</li><li>兼容 Flink 的 DataStream API 和 Table API/SQL</li></ul><ol start="2"><li>关键能力</li></ol><ul><li>增量数据消费（从指定快照/标签/分支开始）</li><li>FLIP-27 新Source源支持</li></ul><h3 id="sql-读取模式" tabindex="-1">SQL 读取模式 <a class="header-anchor" href="#sql-读取模式" aria-label="Permalink to &quot;SQL 读取模式&quot;">​</a></h3><p>批处理读取</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET execution.runtime-mode = batch;</span></span>
<span class="line"><span>-- 全量读取表数据</span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t1;</span></span></code></pre></div><h3 id="流式读取" tabindex="-1">流式读取 <a class="header-anchor" href="#流式读取" aria-label="Permalink to &quot;流式读取&quot;">​</a></h3><p>增量读取</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET execution.runtime-mode = streaming;</span></span>
<span class="line"><span> -- 启用动态表选项</span></span>
<span class="line"><span>SET table.dynamic-table-options.enabled=false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>-- 从当前快照开始持续读取增量数据 monitor_interval 监控数据的间隔，默认1s</span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t1 /*+ OPTIONS(&#39;streaming&#39;=&#39;true&#39;, &#39;monitor-interval&#39;=&#39;1s&#39;)*/ ;</span></span></code></pre></div><p>读取指定快照</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-- 从指定快照开始读取（不包含该快照数据）</span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t1 /*+ OPTIONS(&#39;streaming&#39;=&#39;true&#39;, &#39;start-snapshot-id&#39;=&#39;915345587701634958&#39;)*/ ;</span></span></code></pre></div><p>读取分支，标签</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET table.exec.iceberg.use-flip27-source = true;</span></span>
<span class="line"><span>--- 读取分支</span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS(&#39;branch&#39;=&#39;branch1&#39;) */ ;</span></span>
<span class="line"><span>--- 读取Tag</span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS(&#39;tag&#39;=&#39;tag1&#39;) */;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>SELECT * FROM ice_hdfs.mj1.t4 /*+ OPTIONS(&#39;streaming&#39;=&#39;true&#39;, &#39;monitor-interval&#39;=&#39;1s&#39;, &#39;start-tag&#39;=&#39;tag1&#39;) */;</span></span></code></pre></div><h2 id="flink-与-iceberg-api" tabindex="-1">Flink 与 Iceberg API <a class="header-anchor" href="#flink-与-iceberg-api" aria-label="Permalink to &quot;Flink 与 Iceberg API&quot;">​</a></h2><p>pom.xml</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>    &lt;groupId&gt;org.apache.iceberg&lt;/groupId&gt;</span></span>
<span class="line"><span>    &lt;artifactId&gt;iceberg-flink-runtime-1.19&lt;/artifactId&gt;</span></span>
<span class="line"><span>    &lt;version&gt;\${iceberg.version}&lt;/version&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre></div><p>Compact</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RewrietDataFiles {</span></span>
<span class="line"><span>    public static void main(String[] args) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        //1.配置TableLoader</span></span>
<span class="line"><span>        Configuration hadoopConf = new Configuration();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        //2.创建Hadoop配置、Catalog配置和表的Schema</span></span>
<span class="line"><span>        Catalog catalog = new HadoopCatalog(hadoopConf,&quot;file:///D:/ice_hdfs/&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        //3.配置iceberg 库名和表名并加载表</span></span>
<span class="line"><span>        TableIdentifier name =</span></span>
<span class="line"><span>                TableIdentifier.of(&quot;mj1&quot;, &quot;t1&quot;);</span></span>
<span class="line"><span>        Table table = catalog.loadTable(name);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        //4..合并 data files 小文件</span></span>
<span class="line"><span>        RewriteDataFilesActionResult result = Actions.forTable(table)</span></span>
<span class="line"><span>                .rewriteDataFiles()</span></span>
<span class="line"><span>                //默认 512M ，</span></span>
<span class="line"><span>                .targetSizeInBytes(536870912L)</span></span>
<span class="line"><span>                .execute();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="案例-spark-建表" tabindex="-1">案例 Spark 建表 <a class="header-anchor" href="#案例-spark-建表" aria-label="Permalink to &quot;案例 Spark 建表&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spark-sql --hiveconf hive.cli.print.header=true</span></span>
<span class="line"><span>set spark.sql.catalog.ice_hdfs = org.apache.iceberg.spark.SparkCatalog;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_hdfs.type = hadoop;</span></span>
<span class="line"><span>set spark.sql.catalog.ice_hdfs.warehouse = hdfs://mj01:8020/lakehouse/ice_hdfs ;</span></span>
<span class="line"><span>use ice_hdfs;</span></span>
<span class="line"><span>create database if not exists ice_hdfs.mj1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>drop table if exists ice_hdfs.mj1.t4;</span></span>
<span class="line"><span>CREATE TABLE ice_hdfs.mj1.t4(</span></span>
<span class="line"><span>    id BIGINT NOT NULL COMMENT &#39;主键&#39;,</span></span>
<span class="line"><span>    data STRING,</span></span>
<span class="line"><span>    dt String,</span></span>
<span class="line"><span>    ts TIMESTAMP)</span></span>
<span class="line"><span>    USING iceberg</span></span>
<span class="line"><span>PARTITIONED BY (dt,hours(ts),bucket(3, id))</span></span>
<span class="line"><span>TBLPROPERTIES (&#39;format-version&#39;=&#39;2&#39;);</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t4   values (1,&#39;t11&#39;,&#39;20250209&#39;,current_timestamp),</span></span>
<span class="line"><span> (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>ALTER TABLE ice_hdfs.mj1.t4 CREATE TAG  \`tag1\`; </span></span>
<span class="line"><span>ALTER TABLE ice_hdfs.mj1.t4 CREATE BRANCH \`branch1\`;</span></span>
<span class="line"><span>INSERT INTO ice_hdfs.mj1.t4   values (1,&#39;t44&#39;,&#39;20250209&#39;,current_timestamp),</span></span>
<span class="line"><span> (1,&#39;t4&#39;,&#39;20250209&#39;,current_timestamp);</span></span>
<span class="line"><span>ALTER TABLE ice_hdfs.mj1.t4 CREATE TAG  \`tag2\`;</span></span></code></pre></div>`,67)]))}const g=s(i,[["render",l]]);export{u as __pageData,g as default};
