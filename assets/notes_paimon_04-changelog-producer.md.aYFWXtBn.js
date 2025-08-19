import{_ as s,c as a,o as p,ae as e}from"./chunks/framework.Bk39dawk.js";const l="/blogs/assets/changelog-none.KNcVfDb5.png",i="/blogs/assets/changelog-input.DDivwcDE.png",t="/blogs/assets/changelog-lookup.DpEvUVbn.png",o="/blogs/assets/none-result.Y8ronckp.png",c="/blogs/assets/input-result.BJ315Wni.png",u="/blogs/assets/lookup-result-1.6Ww1QM9d.png",r="/blogs/assets/lookup-input-result-1.D-kTza4y.png",b=JSON.parse('{"title":"Changelog Producer","description":"","frontmatter":{"title":"Changelog Producer","tags":"Paimon","outline":"deep"},"headers":[],"relativePath":"notes/paimon/04-changelog-producer.md","filePath":"notes/paimon/04-changelog-producer.md","lastUpdated":1755613624000}'),g={name:"notes/paimon/04-changelog-producer.md"};function d(m,n,h,k,f,E){return p(),a("div",null,n[0]||(n[0]=[e('<h1 id="changelog-producer" tabindex="-1">Changelog Producer <a class="header-anchor" href="#changelog-producer" aria-label="Permalink to &quot;Changelog Producer&quot;">​</a></h1><p>Chaneglog producer 的主要目的是为了在 Paimon 表上产生流读的 changelog, 如果只是批读的表是可以不用设置 Chaneglog producer 的.</p><p>比如数据库如 MySQL 来说, 当执行的语句涉及数据的修改例如插入、更新、删除时，MySQL 会将这些数据变动记录在 binlog 中。相当于额外记录一份操作日志, Paimon 中用Changelog来表示对应参数是 changelog producer，有四种模式none、input、lookup、compaction。</p><h2 id="为什么要有changelog-producer" tabindex="-1">为什么要有changelog producer？ <a class="header-anchor" href="#为什么要有changelog-producer" aria-label="Permalink to &quot;为什么要有changelog producer？&quot;">​</a></h2><p>Paimon表需要将数据的增、删、改操作保存为的变更数据（changelog），有了变更数据下游才能进行流消费。通过在WITH参数中设置changelog-producer，Paimon将会以不同的方式产生变更数据。</p><h2 id="none" tabindex="-1">None <a class="header-anchor" href="#none" aria-label="Permalink to &quot;None&quot;">​</a></h2><p>不查找旧值, 不额外写Chaneglog</p><p><img src="'+l+'" alt=""></p><p>默认就是 none, 这种模式下在 Paimon 不会额外存储数据。Source 读取的时候, 就是将 snapshot 的 delta list 文件读取出来, 就是本次 Snapshot 的增量 Changelog 了。Paimon主键表将不会产出完整的变更数据。 在 None 模式中,虽然在 Paimon 侧没有占用额外的存储, 但是在下游的流任务的状态中, 其实是有一份全量表的额外存储的开销的 使用场景：Paimon表通过批作业进行消费。</p><h2 id="input" tabindex="-1">Input <a class="header-anchor" href="#input" aria-label="Permalink to &quot;Input&quot;">​</a></h2><p>不查找旧值, 额外写Chaneglog.</p><p>Paimon主键表会直接将输入的消息作为变更数据传递给下游消费者。输入数据流本身是完整的变更数据时（例如数据库的Binlog）使用。input机制不涉及额外的计算，因此其效率最高。</p><p><img src="'+i+'" alt=""></p><p>使用场景：关系型数据库binlog日志的采集</p><h2 id="lookup" tabindex="-1">Lookup <a class="header-anchor" href="#lookup" aria-label="Permalink to &quot;Lookup&quot;">​</a></h2><p>查找旧值, 额外存储changelog</p><p>Paimon主键表在Flink作业每次创建检查点（checkpoint）时触发小文件合并（compaction），并利用小文件合并的结果产生完整的变更数据。在 compaction 的过程中, 会去向高层查找本次新增 key 的旧值, 如果没有查找到, 那么本次的就是新增 key, 如果有查找到, 那么就生成完整的 UB 和 UA 消息.</p><p><img src="'+t+`" alt=""></p><p>使用场景：表在写入过程中有计算逻辑（partial-update/aggregation 合并引擎）使用该模式，用来通过查找旧值来生成正确的Changelog。与full-compaction机制相比，lookup机制的时效性更好。</p><h2 id="full-compact" tabindex="-1">Full-compact <a class="header-anchor" href="#full-compact" aria-label="Permalink to &quot;Full-compact&quot;">​</a></h2><p>查找旧值, 额外存储 Chaneglog</p><p>Paimon主键表会在每一次执行小文件全量合并（full compaction）时，产生完整的changelog变更数据。</p><p>这种模式下一般通过设置 full-compaction.delta-commits 定期进行 full compact, 因为 full compact 其实代价是比较高的. 所以这种模式整体的开销也是比较大。</p><p>full compaction 时间 = full-compaction.delta-commits次数乘以checkpoint时间。e.g. 3 * 60 s = 3分钟</p><p>注意：由于小文件全量合并会消耗较多计算资源，因此频率不宜过高，建议每30分钟至1小时强制执行一次。</p><h3 id="lookup-vs-full-compaction" tabindex="-1">Lookup VS full compaction <a class="header-anchor" href="#lookup-vs-full-compaction" aria-label="Permalink to &quot;Lookup VS full compaction&quot;">​</a></h3><p>无论输入数据流是否为完整的变更数据，都可以使用lookup、full-compaction。</p><p>lookup：与full-compaction相比较，lookup机制的时效性更好，但总体来看耗费的资源更多。如果数据时效性要求很高（分钟级）的情况下使用。</p><p>full-compaction：与lookup机制相比，full-compaction机制的时效性较差，小文件合并流程，不产生额外计算，因此总体来看耗费的资源更少。数据时效性（小时级）的情况下使用。由于小文件全量合并会消耗较多计算资源，因此频率不宜过高，建议每30分钟至1小时强制执行一次。</p><p>&#39;full-compaction.delta-commits&#39; = &#39;{num}&#39;：Paimon在每{num}个Flink作业的检查点执行小文件全量合并。</p><h2 id="案例" tabindex="-1">案例 <a class="header-anchor" href="#案例" aria-label="Permalink to &quot;案例&quot;">​</a></h2><h3 id="none-案例" tabindex="-1">None 案例 <a class="header-anchor" href="#none-案例" aria-label="Permalink to &quot;None 案例&quot;">​</a></h3><p>没有changelog文件的保存，但是流状态查询依然能够查询到。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;changelog&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.none_init(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span> \`name\` String,</span></span>
<span class="line"><span> \`salary\` Int,</span></span>
<span class="line"><span> PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;deduplicate&#39;,</span></span>
<span class="line"><span>&#39;changelog-producer&#39;=&#39;none&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.none_init values(1,&#39;flink&#39;,1000);</span></span>
<span class="line"><span>insert into paimon.test.none_init values(1,&#39;flink&#39;,2000);</span></span>
<span class="line"><span>insert into paimon.test.none_init values(1,&#39;flink&#39;,3000);</span></span>
<span class="line"><span></span></span>
<span class="line"><span> SELECT * FROM paimon.test.none_init /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span></code></pre></div><p>结果</p><p><img src="`+o+`" alt=""></p><h3 id="input-案例" tabindex="-1">Input 案例 <a class="header-anchor" href="#input-案例" aria-label="Permalink to &quot;Input 案例&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;10 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;changelog&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.input_init(</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span> \`name\` String,</span></span>
<span class="line"><span> \`salary\` Int,</span></span>
<span class="line"><span> PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>) with  (</span></span>
<span class="line"><span>&#39;merge-engine&#39; = &#39;deduplicate&#39;,</span></span>
<span class="line"><span>&#39;changelog-producer&#39;=&#39;input&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.input_init values(1,&#39;flink&#39;,1000);</span></span>
<span class="line"><span>insert into paimon.test.input_init values(1,&#39;flink&#39;,2000);</span></span>
<span class="line"><span>insert into paimon.test.input_init values(1,&#39;flink&#39;,3000);</span></span>
<span class="line"><span>insert into paimon.test.input_init values(1,&#39;flink&#39;,4000);</span></span>
<span class="line"><span>insert into paimon.test.input_init values(1,&#39;flink&#39;,4001);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span> SELECT * FROM paimon.test.input_init /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span></code></pre></div><p>文件路径下除了data文件外，会生成changelog文件。 会另外保存一份changelog的数据。</p><p>结果</p><p><img src="`+c+`" alt=""></p><p>只保存变更，不做计算。图中输入时只有insert数据，因此变更只有 +I。</p><h3 id="lookup-案例1" tabindex="-1">Lookup 案例1 <a class="header-anchor" href="#lookup-案例1" aria-label="Permalink to &quot;Lookup 案例1&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;120 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;changelog&#39;;</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.lookup_input (</span></span>
<span class="line"><span> \`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`salary\` Int,</span></span>
<span class="line"><span>  \`sum_cnt\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>)  with  (</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;aggregation&#39;,</span></span>
<span class="line"><span>  &#39;fields.salary.aggregate-function&#39; = &#39;max&#39;,</span></span>
<span class="line"><span>  &#39;fields.sum_cnt.aggregate-function&#39; = &#39;sum&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;input&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.lookup_lookup (</span></span>
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
<span class="line"><span>insert into paimon.test.lookup_input  values(1,&#39;flink&#39;,1000,1000);</span></span>
<span class="line"><span>insert into paimon.test.lookup_input values(1,&#39;flink&#39;,2000,2000);</span></span>
<span class="line"><span>insert into paimon.test.lookup_input values(1,&#39;flink&#39;,500,500);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.lookup_lookup values(1,&#39;flink&#39;,1000,1000);</span></span>
<span class="line"><span>insert into paimon.test.lookup_lookup values(1,&#39;flink&#39;,2000,2000);</span></span>
<span class="line"><span>insert into paimon.test.lookup_lookup values(1,&#39;flink&#39;,500,500);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 结果：1,&#39;flink&#39;,2000,3500</span></span>
<span class="line"><span></span></span>
<span class="line"><span> SELECT * FROM paimon.test.lookup_input /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> SELECT * FROM paimon.test.lookup_lookup  /*+ OPTIONS(&#39;scan.snapshot-id&#39; = &#39;1&#39;) */</span></span></code></pre></div><p>案例分别向input模式的表和lookup模式的表插入3条数据吗，比较了input模式和lookup模式的差异，</p><p><img src="`+u+'" alt=""> lookup模式下，变更数据过来之后，会查找旧值，compact之后生成新的数据文件。</p><p><img src="'+r+`" alt=""> input模式下，只有最初的变更。</p><h3 id="lookup-案例2" tabindex="-1">Lookup 案例2 <a class="header-anchor" href="#lookup-案例2" aria-label="Permalink to &quot;Lookup 案例2&quot;">​</a></h3><p>这个案例中checkpoint间隔时间更长，为1分钟。产生changelog。与后面的Compactin案例做比较。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;60 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;changelog&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists lookup_input (</span></span>
<span class="line"><span>  \`id\` Int PRIMARY KEY NOT ENFORCED,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`age\` Int</span></span>
<span class="line"><span>) with (</span></span>
<span class="line"><span>&#39;connector&#39; = &#39;datagen&#39;,</span></span>
<span class="line"><span>&#39;fields.id.kind&#39; = &#39;random&#39;,</span></span>
<span class="line"><span>&#39;fields.id.min&#39; = &#39;1&#39;,</span></span>
<span class="line"><span>&#39;fields.id.max&#39; = &#39;100&#39;,</span></span>
<span class="line"><span>&#39;fields.name.length&#39; = &#39;10&#39;,</span></span>
<span class="line"><span>&#39;fields.age.min&#39; = &#39;18&#39;,</span></span>
<span class="line"><span>&#39;fields.age.max&#39; = &#39;60&#39;,</span></span>
<span class="line"><span>&#39;rows-per-second&#39; = &#39;3&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.lookup_lookup (</span></span>
<span class="line"><span>\`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`age\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>)  with  (</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;aggregation&#39;,</span></span>
<span class="line"><span>  &#39;fields.age.aggregate-function&#39; = &#39;sum&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;lookup&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.lookup_lookup </span></span>
<span class="line"><span>select * from default_catalog.default_database.lookup_input ;</span></span></code></pre></div><h3 id="compaction-案例" tabindex="-1">Compaction 案例 <a class="header-anchor" href="#compaction-案例" aria-label="Permalink to &quot;Compaction 案例&quot;">​</a></h3><p>在这个例子中，checkpoint间隔是1分钟，delta-cOPommits设置为3次。最后也就是每隔3分钟会触发一次full compaction. 产生changelog.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET &#39;execution.runtime-mode&#39; = &#39;streaming&#39;;</span></span>
<span class="line"><span>SET &#39;table.exec.sink.upsert-materialize&#39;=&#39;NONE&#39;;~~~~</span></span>
<span class="line"><span>--设置检查点的间隔为1分钟</span></span>
<span class="line"><span>SET &#39;execution.checkpointing.interval&#39;=&#39;60 s&#39;;</span></span>
<span class="line"><span>set parallelism.default=1;</span></span>
<span class="line"><span>SET &#39;sql-client.execution.result-mode&#39; = &#39;changelog&#39;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>CREATE TABLE if not exists compaction_input (</span></span>
<span class="line"><span>  \`id\` Int PRIMARY KEY NOT ENFORCED,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`age\` Int</span></span>
<span class="line"><span>) with (</span></span>
<span class="line"><span>&#39;connector&#39; = &#39;datagen&#39;,</span></span>
<span class="line"><span>&#39;fields.id.kind&#39; = &#39;random&#39;,</span></span>
<span class="line"><span>&#39;fields.id.min&#39; = &#39;1&#39;,</span></span>
<span class="line"><span>&#39;fields.id.max&#39; = &#39;100&#39;,</span></span>
<span class="line"><span>&#39;fields.name.length&#39; = &#39;10&#39;,</span></span>
<span class="line"><span>&#39;fields.age.min&#39; = &#39;18&#39;,</span></span>
<span class="line"><span>&#39;fields.age.max&#39; = &#39;60&#39;,</span></span>
<span class="line"><span>&#39;rows-per-second&#39; = &#39;3&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span>CREATE CATALOG paimon WITH (</span></span>
<span class="line"><span>    &#39;type&#39; = &#39;paimon&#39;,</span></span>
<span class="line"><span>    &#39;warehouse&#39; = &#39;hdfs://bigdata01:8020/lakehouse&#39;</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>USE CATALOG paimon;</span></span>
<span class="line"><span>create database if not exists test;</span></span>
<span class="line"><span>CREATE TABLE if not exists paimon.test.compaction (</span></span>
<span class="line"><span>\`id\` Int,</span></span>
<span class="line"><span>  \`name\` String,</span></span>
<span class="line"><span>  \`age\` Int,</span></span>
<span class="line"><span>   PRIMARY KEY (id) NOT ENFORCED</span></span>
<span class="line"><span>)  with  (</span></span>
<span class="line"><span>  &#39;merge-engine&#39; = &#39;aggregation&#39;,</span></span>
<span class="line"><span>  &#39;fields.age.aggregate-function&#39; = &#39;sum&#39;,</span></span>
<span class="line"><span>   &#39;changelog-producer&#39; = &#39;full-compaction&#39;,</span></span>
<span class="line"><span>    &#39;full-compaction.delta-commits&#39;=&#39;3&#39;</span></span>
<span class="line"><span>);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>insert into paimon.test.compaction </span></span>
<span class="line"><span>select * from default_catalog.default_database.compaction_input ;</span></span></code></pre></div>`,53)]))}const _=s(g,[["render",d]]);export{b as __pageData,_ as default};
