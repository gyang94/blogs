import{_ as n,c as s,o as e,ae as i}from"./chunks/framework.Bk39dawk.js";const p="/blogs/assets/paimon.DpJ_VVYz.png",u=JSON.parse('{"title":"Paimon","description":"","frontmatter":{"title":"Paimon","tags":"Paimon","outline":"deep"},"headers":[],"relativePath":"notes/paimon/01-intro.md","filePath":"notes/paimon/01-intro.md","lastUpdated":1750348555000}'),l={name:"notes/paimon/01-intro.md"};function t(o,a,r,c,m,d){return e(),s("div",null,a[0]||(a[0]=[i('<h1 id="paimon简介" tabindex="-1">Paimon简介 <a class="header-anchor" href="#paimon简介" aria-label="Permalink to &quot;Paimon简介&quot;">​</a></h1><p>Flink 社区希望能够将 Flink 的 Streaming 实时计算能力和 Lakehouse 新架构优势进一步结合，推出新一代的 Streaming Lakehouse 技术，促进数据在数据湖上真正实时流动起来，并为用户提供实时离线一体化的开发体验。Flink 社区内部孵化了 Flink Table Store （简称 FTS ）子项目，一个真正面向 Streaming 以及 Realtime的数据湖存储项目。2023年3月12日，FTS进入 Apache 软件基金会 (ASF) 的孵化器，改名为 Apache Paimon (incubating)。 Apache Paimon是一个流数据湖平台，具有高速数据摄取、变更日志跟踪和高效的实时分析的能力。</p><h2 id="paimon特性" tabindex="-1">Paimon特性 <a class="header-anchor" href="#paimon特性" aria-label="Permalink to &quot;Paimon特性&quot;">​</a></h2><p><img src="'+p+`" alt=""></p><p>paimon、hudi、iceberg都是在hdfs、对象存储（S3、OSS、OBS）上的表格式（以表形式布局数据），基于flink等引擎可以对表格式进行管理。</p><ul><li>读/写：可以读取kafka、pulsar、mysql(binlog)等数据增量存储到HDFS、对象。</li><li>生态： 除了Apache Flink之外，Paimon还支持Apache Hive、Apache Spark、Trino、Apache Doris、starrocks等其他计算引擎的读取。</li><li>统一存储: 内部Paimon 将列式文件存储在文件系统/对象存储上，并使用 LSM 树结构来支持大量数据更新和高性能查询。</li></ul><p>Paimon 提供表抽象。它的使用方式与传统数据库没有什么区别：</p><ul><li>在批处理执行模式下，它就像一个Hive表，支持Batch SQL的各种操作。查询它以查看最新的快照。</li><li>在流执行模式下，它的作用就像一个消息队列。查询它的行为就像从历史数据永不过期的消息队列中查询流更改日志。</li></ul><p>Paimon核心特性:</p><ol><li>统一批处理和流处理：离线、实时共用一份数据，支持生成变更日志、支持流式更新、支持流读、批读。</li><li>各种合并引擎：根据需求更新记录部分更新、聚合等。</li><li>丰富的表类型：主键表、Append 表。</li><li>模式演化：支持完整表结构的变化</li></ol><h2 id="sql操作" tabindex="-1">SQL操作 <a class="header-anchor" href="#sql操作" aria-label="Permalink to &quot;SQL操作&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://mj01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists merge_test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.deduplicate_test1(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) ;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,1000);</span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,2000);</span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,500);</span></span></code></pre></div>`,12)]))}const _=n(l,[["render",t]]);export{u as __pageData,_ as default};
