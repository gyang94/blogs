import{_ as a,c as n,o as p,ae as i}from"./chunks/framework.Bk39dawk.js";const k=JSON.parse('{"title":"Paimon tables","description":"","frontmatter":{"title":"Paimon tables","tags":"Paimon","outline":"deep"},"headers":[],"relativePath":"notes/paimon/03-paimon-table.md","filePath":"notes/paimon/03-paimon-table.md","lastUpdated":1752891386000}'),e={name:"notes/paimon/03-paimon-table.md"};function l(t,s,c,h,d,o){return p(),n("div",null,s[0]||(s[0]=[i(`<h1 id="主键表和append-only表" tabindex="-1">主键表和Append Only表 <a class="header-anchor" href="#主键表和append-only表" aria-label="Permalink to &quot;主键表和Append Only表&quot;">​</a></h1><h2 id="主键表" tabindex="-1">主键表 <a class="header-anchor" href="#主键表" aria-label="Permalink to &quot;主键表&quot;">​</a></h2><p>Paimon主键（Primary Key）表：表中每一行数据都有一个唯一主键，用来表示唯一的一行数据。</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> TABLE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> if</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> not</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> exists</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> paimon</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">test</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.bucket_num (</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  \`id\`</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  \`name\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  \`age\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> intnt,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  \`dt\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> string,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  PRIMARY KEY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`id\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`dt\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ENFORCED</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) PARTITIONED </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`dt\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WITH</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;bucket&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;2&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;merge-engine&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;deduplicate&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;file.format&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;avro&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h3 id="分桶方式" tabindex="-1">分桶方式 <a class="header-anchor" href="#分桶方式" aria-label="Permalink to &quot;分桶方式&quot;">​</a></h3><p>Bucket 桶是Paimon表读写操作的最小单元。非分区、分区的数据都会写入到对应的桶中。</p><p>创建Paimon主键表时，在WITH参数中指定&#39;bucket&#39; = &#39;{num}&#39;</p><ol><li>&#39;{num}&#39; 为2、3正数的则是固定桶</li><li>&#39;{num}&#39; 值为 -1，或者不写<code>buckent={num}</code> 则表示动态桶</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket_num (</span></span>
<span class="line"><span> \`id\` Int PRIMARY KEY NOT ENFORCED,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`age\` Int,</span></span>
<span class="line"><span>  \`dt\` string,</span></span>
<span class="line"><span>   PRIMARY KEY (id, dt) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;2&#39;, -- bucket=4  固定分桶、&#39;bucket&#39; = &#39;-1&#39; 动态分桶</span></span>
<span class="line"><span> &#39;merge-engine&#39; = &#39;deduplicate&#39;, -- deduplicate 是默认值，可以不设置，相同的主键数据，保留最新的</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39; --格式 parquet、orc、avro</span></span>
<span class="line"><span>);</span></span></code></pre></div><h3 id="固定桶主键表-fixed-bucket" tabindex="-1">固定桶主键表 Fixed Bucket <a class="header-anchor" href="#固定桶主键表-fixed-bucket" aria-label="Permalink to &quot;固定桶主键表 Fixed Bucket&quot;">​</a></h3><ol><li>有分区键的情况下 主键字段必须包括分区字段 。</li><li>Bucket 个数会影响并发度，影响性能，建议每个分桶的数据大小在2 GB左右，最大不超过5 GB。</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id,dt) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;2&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39; </span></span>
<span class="line"><span>);</span></span></code></pre></div><p>注意：分桶数限制了实际工作的作业并发数，单个分桶内数据总量太大可能导致读写性能的降低。</p><p><strong>假如有多个作业（insert into）如何支持写入一张表?</strong></p><p>如果要支持多个insert into table select …… 写入到相同的一张表 设置参数 &#39;write-only&#39;=&#39;true&#39; （单独启动一个Dedicated Compaction Job） 否则会报错：Conflicts during commits. Multiple jobs are writing into the same partition at the same time.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> &#39;write-only&#39;=&#39;true&#39; --取决于是否多个任务写一张表</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id,dt) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;2&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39;,</span></span>
<span class="line"><span>  &#39;write-only&#39;=&#39;true&#39; </span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// two job</span></span>
<span class="line"><span>========================================</span></span>
<span class="line"><span>insert into  paimon.test.bucket2 select id,name,age,date_format(CURRENT_TIMESTAMP,&#39;yyyyMMdd&#39;) from default_catalog.default_database.datagen1 ;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into  paimon.test.bucket2 select id,name,age,date_format(CURRENT_TIMESTAMP,&#39;yyyyMMdd&#39;) from default_catalog.default_database.datagen1 ;</span></span></code></pre></div><h3 id="动态分桶主键表-dynamic-bucket" tabindex="-1">动态分桶主键表 Dynamic Bucket <a class="header-anchor" href="#动态分桶主键表-dynamic-bucket" aria-label="Permalink to &quot;动态分桶主键表 Dynamic Bucket&quot;">​</a></h3><p>注意：动态分桶表的主键可以包含分区字段也可以包含不分区字段。</p><p>Paimon will automatically expand the number of buckets.</p><ul><li>Option1: &#39;dynamic-bucket.target-row-num&#39;: controls the target row number for one bucket.</li><li>Option2: &#39;dynamic-bucket.initial-buckets&#39;: controls the number of initialized bucket.</li><li>Option3: &#39;dynamic-bucket.max-buckets&#39;: controls the number of max buckets.</li></ul><h4 id="主键包括分区键" tabindex="-1">主键包括分区键 <a class="header-anchor" href="#主键包括分区键" aria-label="Permalink to &quot;主键包括分区键&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id,dt) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;-1&#39;,</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;deduplicate&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39; </span></span>
<span class="line"><span>);</span></span></code></pre></div><p>paimon表可以确定该主键属于哪个分区，但是确定不来属于哪个分桶。需要额外的堆内存创建<strong>索引</strong>，以维护主键与分桶编号的映射关系。</p><p>主键完全包含分区键的动态分桶表，Paimon可以确定该主键属于哪个分区，无法确定属于哪个分桶，因此需要使用额外的堆内存创建索引(index)，维护主键与分桶编号的映射关系。</p><p>具体来说，每1亿条主键将额外消耗1 GB的堆内存。只有当前正在写入的分区才会消耗堆内存，历史分区中的主键不会消耗堆内存。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id,dt) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;-1&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39; </span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.bucket2 values</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-01&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-03&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查询返回3条数据</span></span></code></pre></div><h4 id="主键不包括分区键" tabindex="-1">主键不包括分区键 <a class="header-anchor" href="#主键不包括分区键" aria-label="Permalink to &quot;主键不包括分区键&quot;">​</a></h4><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;-1&#39;,</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;deduplicate&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39; </span></span>
<span class="line"><span>);</span></span></code></pre></div><ol><li>如果主键不包含分区键，Paimon无法根据主键确定该数据属于哪个分区的哪个分桶，使用RocksDB维护主键与分区以及分桶编号的映射关系</li><li>对性能会造成明显影响，1.维护映射关系。2.每次作业启动的时候，需要将映射关系全量加到RocksDB中，作业启动也会相对变慢。</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string,</span></span>
<span class="line"><span>  PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;-1&#39;,</span></span>
<span class="line"><span> &#39;file.format&#39;=&#39;avro&#39;,</span></span>
<span class="line"><span> &#39;sink.parallelism&#39; = &#39;2&#39; </span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.bucket2 values</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-01&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-03&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查询返回一条数据，因为主键id一样</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE my_table (id bigint,product_id BIGINT,price DOUBLE,sales BIGINT) </span></span>
<span class="line"><span>PARTITIONED BY (id) WITH (&#39;bucket&#39; = &#39;3&#39;,&#39;bucket-key&#39; = &#39;product_id&#39;);</span></span></code></pre></div><h4 id="主键表-fixed-bucket-dynamic-bucket" tabindex="-1">主键表 fixed bucket，dynamic bucket <a class="header-anchor" href="#主键表-fixed-bucket-dynamic-bucket" aria-label="Permalink to &quot;主键表 fixed bucket，dynamic bucket&quot;">​</a></h4><p>固定桶：不支持跨分区更新（因为分区键必须包含在主键中，直接通过hash确定数据在哪个桶）</p><p>动态桶（主键不包括分区字段）：支持跨分区更新 动态桶（主键包括分区字段）： 可以确定分区，不支持跨分区更新</p><h4 id="桶的更新" tabindex="-1">桶的更新 <a class="header-anchor" href="#桶的更新" aria-label="Permalink to &quot;桶的更新&quot;">​</a></h4><ol><li>固定桶支持动态调整桶的大小。</li><li>当分桶的数据量超过限制时，再自动创建新的分桶。创建新桶的条件</li></ol><ul><li>dynamic-bucket.target-row-num：每个分桶最多存储几条数据。默认值为2000000。</li><li>dynamic-bucket.initial-buckets：初始的分桶数。如果不设置，初始将会创建等同于writer算子并发数的分桶。</li><li>dynamic-bucket.max-buckets: 最大分桶数。</li></ul><h2 id="append-only表-非主键表" tabindex="-1">Append Only表（非主键表） <a class="header-anchor" href="#append-only表-非主键表" aria-label="Permalink to &quot;Append Only表（非主键表）&quot;">​</a></h2><p>如果在创建Paimon表时没有指定主键（Primary Key），则该表就是Paimon Append Only表。只能以流式方式将完整记录插入到表中，适合不需要流式更新的场景（例如日志数据同步）。</p><p>两种模式：Scalable 表 与 Queue 表。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>0.9.0新特性</span></span>
<span class="line"><span>Append 表的删改支持：此版本引入了 Append 的 DELETE &amp; UPDATE &amp; MERGEINTO 支持，你可以通过 Spark SQL 来删改 Append 表，并且它还支持 Deletion Vectors 模式</span></span></code></pre></div><h3 id="scalable表" tabindex="-1">Scalable表 <a class="header-anchor" href="#scalable表" aria-label="Permalink to &quot;Scalable表&quot;">​</a></h3><p>定义 bucket 为 -1，且没有主键时，就是一张增强的 Hive 表，没有桶的概念 (数据会放到 bucket-0 目录中，桶是被忽略的，所有的读写并没有并发限制)，支持批写批读，支持流写流读，只是它的流读会有一部分乱序 (并不是完全的输入顺序)。</p><p>注意：适合对数据的流式消费顺序没有需求场景。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2(</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string</span></span>
<span class="line"><span>) PARTITIONED BY (dt) with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;-1&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.bucket2 values</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-01&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-03&#39;);</span></span></code></pre></div><h3 id="queue表" tabindex="-1">Queue表 <a class="header-anchor" href="#queue表" aria-label="Permalink to &quot;Queue表&quot;">​</a></h3><p>作为消息队列具有分钟级延迟的替代。Paimon表的分桶数此时相当于Kafka的Partition数。 数据在每个bucket里面默认有序</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>CREATE TABLE if not exists paimon.test.bucket2 (</span></span>
<span class="line"><span>  id bigint,</span></span>
<span class="line"><span>  name String,</span></span>
<span class="line"><span>  age Int,</span></span>
<span class="line"><span>  dt string</span></span>
<span class="line"><span>)  with  (</span></span>
<span class="line"><span> &#39;bucket&#39; = &#39;5&#39;,</span></span>
<span class="line"><span> &#39;bucket-key&#39; = &#39;id&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.bucket2 values</span></span>
<span class="line"><span>(1,&#39;zhangsan&#39;,18,&#39;2023-01-01&#39;),</span></span>
<span class="line"><span>(2,&#39;zhangsan&#39;,18,&#39;2023-01-01&#39;),</span></span>
<span class="line"><span>(3,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(3,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(4,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(5,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(6,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(7,&#39;zhangsan&#39;,18,&#39;2023-01-02&#39;),</span></span>
<span class="line"><span>(8,&#39;zhangsan&#39;,18,&#39;2023-01-03&#39;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 会创建出5个桶</span></span></code></pre></div><h3 id="scalable表-vs-queue表" tabindex="-1">Scalable表 vs Queue表 <a class="header-anchor" href="#scalable表-vs-queue表" aria-label="Permalink to &quot;Scalable表 vs Queue表&quot;">​</a></h3><h4 id="数据分发" tabindex="-1">数据分发 <a class="header-anchor" href="#数据分发" aria-label="Permalink to &quot;数据分发&quot;">​</a></h4><p>Scalable ：没有桶的概念，无需考虑数据顺序、无需对数据进行hash partitioning，多个并发可以同时写同一个分区，Scalable 表写入速度更快。</p><p>Queue ：默认情况下，Paimon将根据每条数据所有列的取值，确定该数据属于哪个分桶（bucket）。也可以在创建Paimon表时，在WITH参数中指定bucket-key参数，不同列的名称用英文逗号分隔。例如，设置&#39;bucket-key&#39; = &#39;c1,c2&#39;，则Paimon将根据每条数据c1和c2两列的值，确定该数据属于哪个分桶。</p><h4 id="数据消费顺序" tabindex="-1">数据消费顺序 <a class="header-anchor" href="#数据消费顺序" aria-label="Permalink to &quot;数据消费顺序&quot;">​</a></h4><p>Scalable ：不能保证数据的消费顺序和写入顺序，适合对数据的流式消费顺序没有需求场景。</p><p>Queue ：表可以保证流式消费Paimon表时，每个分桶中数据的消费顺序与数据写入Paimon表的顺序一致。具体来说：</p><ul><li>如果表参数中设置了&#39;scan.plan-sort-partition&#39; = &#39;true&#39;，则分区内值更小的数据会首先产出。</li><li>如果表参数中未设置&#39;scan.plan-sort-partition&#39; = &#39;true&#39;，则分区内创建时间更早的数据会首先产出，先进先出。</li><li>对于两条来自相同分区的相同分桶的数据，先写入Paimon表的数据会首先产出。</li><li>对于两条来自相同分区但不同分桶的数据，由于不同分桶可能被不同的Flink作业并发处理，因此不保证两条数据的消费顺序。</li></ul>`,55)]))}const u=a(e,[["render",l]]);export{k as __pageData,u as default};
