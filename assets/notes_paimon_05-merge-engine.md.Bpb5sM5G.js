import{_ as s,c as a,o as p,ae as e}from"./chunks/framework.Bk39dawk.js";const l="/blogs/assets/deduplicate-result.DHnZI9Wh.png",i="/blogs/assets/deduplicate-result-1.D9em_RN4.png",t="/blogs/assets/first-row-streaming-read.WyPJwvkA.png",c="/blogs/assets/aggregation-none.D6olOnuL.png",o="/blogs/assets/partial-update-result.B1qzObZ6.png",_=JSON.parse('{"title":"Merge Engine","description":"","frontmatter":{"title":"Merge Engine","tags":"Paimon","outline":"deep"},"headers":[],"relativePath":"notes/paimon/05-merge-engine.md","filePath":"notes/paimon/05-merge-engine.md","lastUpdated":1756002340000}'),r={name:"notes/paimon/05-merge-engine.md"};function u(g,n,d,m,h,E){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="merge-engine" tabindex="-1">Merge Engine <a class="header-anchor" href="#merge-engine" aria-label="Permalink to &quot;Merge Engine&quot;">​</a></h1><p>相同主键的多条数据，Paimon会根据merge-engine参数对数据进行合并</p><h2 id="deduplicate" tabindex="-1">Deduplicate <a class="header-anchor" href="#deduplicate" aria-label="Permalink to &quot;Deduplicate&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&#39;merge-engine&#39; = &#39;deduplicate&#39; -- deduplicate 是默认值，可以不设置</span></span></code></pre></div><p>对于多条相同主键的数据，主键表仅会保留最新一条数据。如果最新数据是delete操作，所有对应主键的数据都会被丢弃。</p><h3 id="deduplicate-案例" tabindex="-1">Deduplicate 案例 <a class="header-anchor" href="#deduplicate-案例" aria-label="Permalink to &quot;Deduplicate 案例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span>
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
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;deduplicate&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.deduplicate_test2(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test2 select * from paimon.merge_test.deduplicate_test1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,1000);</span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,2000);</span></span>
<span class="line"><span>insert into paimon.merge_test.deduplicate_test1 values(1,&#39;flink&#39;,500);</span></span></code></pre></div><p>结果只有最新的一条数据</p><p><img src="`+l+'" alt=""></p><p><img src="'+i+`" alt=""></p><h2 id="first-row" tabindex="-1">First-row <a class="header-anchor" href="#first-row" aria-label="Permalink to &quot;First-row&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&#39;merge-engine&#39; = &#39;first-row&#39;</span></span></code></pre></div><p>Paimon只会保留相同主键数据中的第一条。与deduplicate合并机制相比，first-row只会产生insert类型的变更数据。</p><p>重点注意：</p><ul><li>下游如果需要流式消费first-row的产生的数据，上游表changelog-producer参数必须设置为 lookup。</li><li>first-row无法处理delete与update_before消息。您可以设置&#39;first-row.ignore-delete&#39; = &#39;true&#39;以忽略这两类消息。</li><li>first-row不支持changelog-producer input、full-compaction模式</li></ul><p>为什么frist-row不支持input、full-compaction模式？</p><ul><li>full-compaction：每一次执行小文件全量合并（full compaction）时，产生完整的变更数据。</li><li>input：直接将输入的消息作为变更数据传递给下游消费者(作为changelog) input、full-compaction严格意义上与first-row相违背。所以first-row支持none、lookup</li></ul><h3 id="first-row-案例" tabindex="-1">First-row 案例 <a class="header-anchor" href="#first-row-案例" aria-label="Permalink to &quot;First-row 案例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists merge_test;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.first_test2(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.first_test1(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;first-row&#39;,</span></span>
<span class="line"><span>&#39;changelog-producer&#39;=&#39;lookup&#39; --none、input、lookup、full-compaction</span></span>
<span class="line"><span> );</span></span>
<span class="line"><span> </span></span>
<span class="line"><span></span></span>
<span class="line"><span> </span></span>
<span class="line"><span>insert into paimon.merge_test.first_test2 select * from paimon.merge_test.first_test1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.first_test1 values(1,&#39;flink&#39;,1000);</span></span>
<span class="line"><span>insert into paimon.merge_test.first_test1 values(1,&#39;flink&#39;,2000);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>SELECT * FROM paimon.merge_test.first_test1 /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span></code></pre></div><p>当merge-engine为first-row的时候，不是所有的changelog producer类型都支持。只有none和lookup类型支持，其他都报错。</p><p><img src="`+t+`" alt=""></p><p>但在流读模式下，none不产生changelog，因此也只能将changelog producer设置为lookup.</p><p>结果只有第一条数据</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>![](./img/05/first-row-result.png)</span></span></code></pre></div><h2 id="aggregate" tabindex="-1">Aggregate <a class="header-anchor" href="#aggregate" aria-label="Permalink to &quot;Aggregate&quot;">​</a></h2><p>具有相同主键的多条数据，主键表将会根据指定的聚合函数进行聚合。对于不属于主键的每一列，都需要通过fields.{field-name}.aggregate-function指定一个聚合函数，否则该列将默认使用last_non_null_value聚合函数。</p><p>支持的聚合函数与对应的数据类型如下：</p><ul><li>sum（求和）：支持DECIMAL、TINYINT、SMALLINT、INTEGER、BIGINT、FLOAT和DOUBLE。</li><li>product（求乘积）：支持DECIMAL、TINYINT、SMALLINT、INTEGER、BIGINT、FLOAT和DOUBLE。</li><li>count（统计非null值总数）：支持INTEGER和BIGINT。</li><li>max（最大值）和min（最小值）：CHAR、VARCHAR、DECIMAL、TINYINT、SMALLINT、INTEGER、BIGINT、FLOAT、DOUBLE、DATE、TIME、TIMESTAMP和TIMESTAMP_LTZ。</li><li>first_value（返回第一次输入的值）和last_value（返回最新输入的值）：支持所有数据类型，包括null。</li><li>first_not_null_value（返回第一次输入的非null值）和last_non_null_value（返回最新输入的非 null 值）：支持所有数据类型。</li><li>listagg（将输入的字符串依次用英文逗号连接）：支持STRING。</li><li>bool_and和bool_or：支持BOOLEAN。</li></ul><p>如果下游需要流式消费aggregation的结果，需要将changelog-producer参数设为input、lookup或full-compaction。</p><h3 id="aggregate-案例" tabindex="-1">Aggregate 案例 <a class="header-anchor" href="#aggregate-案例" aria-label="Permalink to &quot;Aggregate 案例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists merge_test;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.aggregation_test2(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>  \`sum_cnt\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.aggregation_test1(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>  \`sum_cnt\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>)  with  (</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;aggregation&#39;,</span></span>
<span class="line"><span>  &#39;fields.salary.aggregate-function&#39; = &#39;max&#39;,</span></span>
<span class="line"><span>  &#39;fields.sum_cnt.aggregate-function&#39; = &#39;sum&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;lookup&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.aggregation_test2 </span></span>
<span class="line"><span>select * from paimon.merge_test.aggregation_test1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.aggregation_test1 values(2,&#39;flink&#39;,1000,1000);</span></span>
<span class="line"><span>insert into paimon.merge_test.aggregation_test1 values(2,&#39;flink&#39;,2000,500);</span></span>
<span class="line"><span>insert into paimon.merge_test.aggregation_test1  values(3,&#39;flink&#39;,500,500);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>SELECT * FROM paimon.merge_test.aggregation_test1 /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span></code></pre></div><p>aggregation不支持none类型的changelog producer，其他类型都支持。 <img src="`+c+`" alt=""></p><p>结果是 salary取最大值2000， sum_cnt求和值2000</p><h2 id="partial-update" tabindex="-1">Partial-update <a class="header-anchor" href="#partial-update" aria-label="Permalink to &quot;Partial-update&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&#39;merge-engine&#39; = &#39;partial-update&#39;</span></span></code></pre></div><p>设置&#39;merge-engine&#39; = &#39;partial-update&#39;后，您可以通过多条消息对数据进行逐步更新，并最终得到完整的数据。即具有相同主键的新数据将会覆盖原来的数据，但值为null的列不会进行覆盖。</p><h3 id="sequence-group-序列组" tabindex="-1">Sequence Group 序列组 <a class="header-anchor" href="#sequence-group-序列组" aria-label="Permalink to &quot;Sequence Group 序列组&quot;">​</a></h3><p>序列字段可能无法解决具有多个流更新的 partial-update 表的无序问题，在多流更新期间，sequence-field 可能会被另一个流的最新数据覆盖。通过设置Sequence Group为不同列分别指定合并顺序</p><p>重点注意：</p><ul><li>如果下游需要流式消费partial-update的结果，changelog-producer参数设为input、lookup或full-compaction。</li><li>partial-update 无法处理 delete 与 update_before 消息。需要设置&#39;partial-update.ignore-delete&#39; = &#39;true&#39; 以忽略这两类消息。</li></ul><p>部分更新效率部分场景下取代left join等链表（shuffle） select id，a,null from streaming1 union all select id,null,b from streaming2</p><h3 id="partial-update-案例1" tabindex="-1">Partial-update 案例1 <a class="header-anchor" href="#partial-update-案例1" aria-label="Permalink to &quot;Partial-update 案例1&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists merge_test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.part1(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` BIGINT,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;partial-update&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;lookup&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.part1 values(1,&#39;flink&#39;,CAST(NULL AS INT));</span></span>
<span class="line"><span>insert into paimon.merge_test.part1 values(1,cast(NULL as STRING),2000);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.part1(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name1\` String,</span></span>
<span class="line"><span>   \`name2\` String,</span></span>
<span class="line"><span>    \`name3\` String,</span></span>
<span class="line"><span>  \`salary1\` BIGINT,</span></span>
<span class="line"><span>   \`salary2\` BIGINT,</span></span>
<span class="line"><span>  \`salary3\` BIGINT,</span></span>
<span class="line"><span>   PRIMARY KEY (id,name1,salary1) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;partial-update&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;lookup&#39;</span></span>
<span class="line"><span>);</span></span></code></pre></div><p>分别插入两次同一主键数据的不同field，最终两次的更新都会到同一条数据上。</p><p><img src="`+o+`" alt=""></p><h3 id="partial-update-案例2-sequence-group" tabindex="-1">Partial-update 案例2 （sequence group） <a class="header-anchor" href="#partial-update-案例2-sequence-group" aria-label="Permalink to &quot;Partial-update 案例2 （sequence group）&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;tableau&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists merge_test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.merge_test.part2(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>   \`sg_1\` Int,</span></span>
<span class="line"><span>  \`salary\` BIGINT,</span></span>
<span class="line"><span>   \`sg_2\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;partial-update&#39;,</span></span>
<span class="line"><span>&#39;changelog-producer&#39; = &#39;input&#39;,</span></span>
<span class="line"><span>&#39;fields.sg_1.sequence-group&#39; = &#39;name&#39;,</span></span>
<span class="line"><span>&#39;fields.sg_2.sequence-group&#39; = &#39;salary&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.merge_test.part2 values(1,&#39;flink&#39;,1,1,1);</span></span>
<span class="line"><span>--    output: +I | 1 | flink | 1 | 1 | 1 </span></span>
<span class="line"><span>insert into paimon.merge_test.part2 values(1,&#39;flink1&#39;,0,1,cast(NULL as Int));</span></span>
<span class="line"><span>--    output: +I | 1 | flink | 1 | 1 | 1 </span></span>
<span class="line"><span>insert into paimon.merge_test.part2 values(1,&#39;flink2&#39;,1,2000,1);</span></span>
<span class="line"><span>--    output: +I | 1 | flink2 | 1 | 2000 | 1 </span></span>
<span class="line"><span>insert into paimon.merge_test.part2 values(1,&#39;flink3&#39;,0,3000,0);</span></span>
<span class="line"><span>--    output: +I | 1 | flink2 | 1 | 2000 | 1 </span></span>
<span class="line"><span>insert into paimon.merge_test.part2 values(1,&#39;flink3&#39;,2,3000,2);</span></span>
<span class="line"><span>--    output: +I | 1 | flink3 | 1 | 3000 | 1</span></span></code></pre></div><p>如果多个流同时更新一个field，无法保证顺序，partial-update时会产生问题，就是无法判读以哪个为准。</p><p>sequence group就是为了保持顺序，如果新的数据的sequence group的值比当前数据的值小，就不会更新数据。</p><p>上面的例子，sg_1这一栏被设置为name这一栏的sequence group。第一条数据(name, sg_1)为(flink, 1).</p><p>第二条新的数据(name, sg_1)为(flink1, 0), 由于seqneuce group的值0比当前值1小，因此不触发更新。name值依然为flink.</p><p>第三条新的数据(name, sg_2)为(flink2, 1), sequence group 为1，不小于当前值，可以触发更新。更新后的数据name变为flink2.</p><p>对于设置为salay的sequence group sg_2也是同理更新数据。</p>`,53)]))}const T=s(r,[["render",u]]);export{_ as __pageData,T as default};
