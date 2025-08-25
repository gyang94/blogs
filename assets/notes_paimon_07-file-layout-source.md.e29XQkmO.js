import{_ as n,c as s,o as p,ae as e}from"./chunks/framework.Bk39dawk.js";const u=JSON.parse('{"title":"File Layouts 2","description":"","frontmatter":{"title":"File Layouts 2","tags":"Paimon","outline":"deep"},"headers":[],"relativePath":"notes/paimon/07-file-layout-source.md","filePath":"notes/paimon/07-file-layout-source.md","lastUpdated":1756131656000}'),i={name:"notes/paimon/07-file-layout-source.md"};function l(t,a,c,o,r,d){return p(),s("div",null,a[0]||(a[0]=[e(`<h1 id="文件布局-源码" tabindex="-1">文件布局-源码 <a class="header-anchor" href="#文件布局-源码" aria-label="Permalink to &quot;文件布局-源码&quot;">​</a></h1><p>paimon文件内容对应的java源码类。</p><h2 id="schema" tabindex="-1">Schema <a class="header-anchor" href="#schema" aria-label="Permalink to &quot;Schema&quot;">​</a></h2><h3 id="schema-0" tabindex="-1">schema-0 <a class="header-anchor" href="#schema-0" aria-label="Permalink to &quot;schema-0&quot;">​</a></h3><p>paimon-core模块下：org.apache.paimon.schema.Schema</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Public</span></span>
<span class="line"><span>public class Schema {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** paimon表 列字段 */</span></span>
<span class="line"><span>    private final List&lt;DataField&gt; fields;</span></span>
<span class="line"><span>    /** paimon表 分区字段 */</span></span>
<span class="line"><span>    private final List&lt;String&gt; partitionKeys;</span></span>
<span class="line"><span>    /** paimon表 主键 */</span></span>
<span class="line"><span>    private final List&lt;String&gt; primaryKeys;</span></span>
<span class="line"><span>    /** paimon表 opetion 参数 */</span></span>
<span class="line"><span>    private final Map&lt;String, String&gt; options;</span></span>
<span class="line"><span>    /** paimon表注释 */</span></span>
<span class="line"><span>    private final String comment;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    }</span></span></code></pre></div><h3 id="datafield" tabindex="-1">DataField <a class="header-anchor" href="#datafield" aria-label="Permalink to &quot;DataField&quot;">​</a></h3><p>paimon-core模块下：org.apache.paimon.schema.DataField</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Public</span></span>
<span class="line"><span>public final class DataField implements Serializable {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static final long serialVersionUID = 1L;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static final String FIELD_FORMAT_WITH_DESCRIPTION = &quot;%s %s &#39;%s&#39;&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static final String FIELD_FORMAT_NO_DESCRIPTION = &quot;%s %s&quot;;</span></span>
<span class="line"><span>    /** 字段id */</span></span>
<span class="line"><span>    private final int id;</span></span>
<span class="line"><span>    /** 字段name */</span></span>
<span class="line"><span>    private final String name;</span></span>
<span class="line"><span>    /** 字段类型 */</span></span>
<span class="line"><span>    private final DataType type;</span></span>
<span class="line"><span>    /** 字段描述 */</span></span>
<span class="line"><span>    private final @Nullable String description;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="snapshot" tabindex="-1">Snapshot <a class="header-anchor" href="#snapshot" aria-label="Permalink to &quot;Snapshot&quot;">​</a></h2><h3 id="snapshot-1" tabindex="-1">snapshot-1 <a class="header-anchor" href="#snapshot-1" aria-label="Permalink to &quot;snapshot-1&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@JsonIgnoreProperties(ignoreUnknown = true)</span></span>
<span class="line"><span>public class Snapshot {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static final long FIRST_SNAPSHOT_ID = 1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static final int TABLE_STORE_02_VERSION = 1;</span></span>
<span class="line"><span>    protected static final int CURRENT_VERSION = 3;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    protected static final String FIELD_VERSION = &quot;version&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_ID = &quot;id&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_SCHEMA_ID = &quot;schemaId&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_BASE_MANIFEST_LIST = &quot;baseManifestList&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_DELTA_MANIFEST_LIST = &quot;deltaManifestList&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_CHANGELOG_MANIFEST_LIST = &quot;changelogManifestList&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_INDEX_MANIFEST = &quot;indexManifest&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_COMMIT_USER = &quot;commitUser&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_COMMIT_IDENTIFIER = &quot;commitIdentifier&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_COMMIT_KIND = &quot;commitKind&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_TIME_MILLIS = &quot;timeMillis&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_LOG_OFFSETS = &quot;logOffsets&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_TOTAL_RECORD_COUNT = &quot;totalRecordCount&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_DELTA_RECORD_COUNT = &quot;deltaRecordCount&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_CHANGELOG_RECORD_COUNT = &quot;changelogRecordCount&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_WATERMARK = &quot;watermark&quot;;</span></span>
<span class="line"><span>    protected static final String FIELD_STATISTICS = &quot;statistics&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 快照版本 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_VERSION)</span></span>
<span class="line"><span>    private final Integer version;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 快照id */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_ID)</span></span>
<span class="line"><span>    private final long id;</span></span>
<span class="line"><span>    /** schema 版本 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_SCHEMA_ID)</span></span>
<span class="line"><span>    private final long schemaId;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // a manifest list recording all changes from the previous snapshots</span></span>
<span class="line"><span>    /** 记录与以前快照相比的所有更改的清单列表  */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_BASE_MANIFEST_LIST)</span></span>
<span class="line"><span>    private final String baseManifestList;</span></span>
<span class="line"><span>    /** 一个清单列表，记录此快照中发生的所有新更改，以实现更快的过期和流式读取 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_DELTA_MANIFEST_LIST)</span></span>
<span class="line"><span>    private final String deltaManifestList;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    /** 一个清单列表，记录此快照中产生的所有变更日志 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_CHANGELOG_MANIFEST_LIST)</span></span>
<span class="line"><span>    @Nullable</span></span>
<span class="line"><span>    private final String changelogManifestList;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /** 记录此表所有索引文件的清单如果没有索引文件，则为null */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_INDEX_MANIFEST)</span></span>
<span class="line"><span>    @JsonInclude(JsonInclude.Include.NON_NULL)</span></span>
<span class="line"><span>    private final String indexManifest;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @JsonProperty(FIELD_COMMIT_USER)</span></span>
<span class="line"><span>    private final String commitUser;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 主要用于快照重复数据删除。 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_COMMIT_IDENTIFIER)</span></span>
<span class="line"><span>    private final long commitIdentifier;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 快照中的变化类型。 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_COMMIT_KIND)</span></span>
<span class="line"><span>    private final CommitKind commitKind;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @JsonProperty(FIELD_TIME_MILLIS)</span></span>
<span class="line"><span>    private final long timeMillis;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @JsonInclude(JsonInclude.Include.NON_NULL)</span></span>
<span class="line"><span>    private final Map&lt;Integer, Long&gt; logOffsets;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 此快照中发生的所有更改的记录计数 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_TOTAL_RECORD_COUNT)</span></span>
<span class="line"><span>    private final Long totalRecordCount;</span></span>
<span class="line"><span>    /** 此快照中发生的所有新更改的记录计数 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_DELTA_RECORD_COUNT)</span></span>
<span class="line"><span>    private final Long deltaRecordCount;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 此快照中生成的所有更改日志的记录计数 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_CHANGELOG_RECORD_COUNT)</span></span>
<span class="line"><span>    private final Long changelogRecordCount;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** 输入记录的水印 */</span></span>
<span class="line"><span>    @JsonProperty(FIELD_WATERMARK)</span></span>
<span class="line"><span>    private final Long watermark;</span></span></code></pre></div><h3 id="commitkind" tabindex="-1">CommitKind <a class="header-anchor" href="#commitkind" aria-label="Permalink to &quot;CommitKind&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public enum CommitKind {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** Changes flushed from the mem table. */</span></span>
<span class="line"><span>    /** 从内存表（mem table）中刷新出来的变化。   */</span></span>
<span class="line"><span>    APPEND,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** Changes by compacting existing data files. */</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 通过压缩现有数据文件产生的变化。</span></span>
<span class="line"><span>     * 压缩操作可能会合并多个数据文件，删除已删除的记录，</span></span>
<span class="line"><span>     * 以及优化数据文件的存储结构，此时的变化类型即为COMPACT。</span></span>
<span class="line"><span>     * */</span></span>
<span class="line"><span>    COMPACT,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** Changes that clear up the whole partition and then add new records. */</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 清除整个分区然后添加新记录的变化。</span></span>
<span class="line"><span>     * 这通常发生在需要对整个分区进行重写或大规模更新时，</span></span>
<span class="line"><span>     * 此时的变化类型即为OVERWRITE。</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    OVERWRITE,</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /** Collect statistics. */</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 收集统计信息的变化。</span></span>
<span class="line"><span>     * 这可能包括对数据的分布、索引的使用情况等进行分析，</span></span>
<span class="line"><span>     * 以优化查询性能或数据布局，此时的变化类型即为ANALYZE。</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    ANALYZE</span></span>
<span class="line"><span>}</span></span></code></pre></div><h2 id="manifest" tabindex="-1">Manifest <a class="header-anchor" href="#manifest" aria-label="Permalink to &quot;Manifest&quot;">​</a></h2><h3 id="manifest-list" tabindex="-1">Manifest List <a class="header-anchor" href="#manifest-list" aria-label="Permalink to &quot;Manifest List&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ManifestList extends ObjectsFile&lt;ManifestFileMeta&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private ManifestList(</span></span>
<span class="line"><span>            FileIO fileIO,</span></span>
<span class="line"><span>            ManifestFileMetaSerializer serializer,</span></span>
<span class="line"><span>            FormatReaderFactory readerFactory,</span></span>
<span class="line"><span>            FormatWriterFactory writerFactory,</span></span>
<span class="line"><span>            PathFactory pathFactory,</span></span>
<span class="line"><span>            @Nullable SegmentsCache&lt;String&gt; cache) {</span></span>
<span class="line"><span>        super(fileIO, serializer, readerFactory, writerFactory, pathFactory, cache);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    }</span></span></code></pre></div><h3 id="manifestfilemeta" tabindex="-1">ManifestFileMeta <a class="header-anchor" href="#manifestfilemeta" aria-label="Permalink to &quot;ManifestFileMeta&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ManifestFileMeta {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static final Logger LOG = LoggerFactory.getLogger(ManifestFileMeta.class);</span></span>
<span class="line"><span>    /** manifest文件名 */</span></span>
<span class="line"><span>    private final String fileName;</span></span>
<span class="line"><span>    /** manifest文件大小 */</span></span>
<span class="line"><span>    private final long fileSize;</span></span>
<span class="line"><span>    /** 添加的文件数量 */</span></span>
<span class="line"><span>    private final long numAddedFiles;</span></span>
<span class="line"><span>    /** 删除的文件数量 */</span></span>
<span class="line"><span>    private final long numDeletedFiles;</span></span>
<span class="line"><span>    /** 分区统计信息 */</span></span>
<span class="line"><span>    private final BinaryTableStats partitionStats;</span></span>
<span class="line"><span>    /** schameId */</span></span>
<span class="line"><span>    private final long schemaId;</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="manifestfile" tabindex="-1">ManifestFile <a class="header-anchor" href="#manifestfile" aria-label="Permalink to &quot;ManifestFile&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ManifestFile extends ObjectsFile&lt;ManifestEntry&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final SchemaManager schemaManager;</span></span>
<span class="line"><span>    private final RowType partitionType;</span></span>
<span class="line"><span>    private final FormatWriterFactory writerFactory;</span></span>
<span class="line"><span>    private final long suggestedFileSize;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private ManifestFile(</span></span>
<span class="line"><span>            FileIO fileIO,</span></span>
<span class="line"><span>            SchemaManager schemaManager,</span></span>
<span class="line"><span>            RowType partitionType,</span></span>
<span class="line"><span>            ManifestEntrySerializer serializer,</span></span>
<span class="line"><span>            FormatReaderFactory readerFactory,</span></span>
<span class="line"><span>            FormatWriterFactory writerFactory,</span></span>
<span class="line"><span>            PathFactory pathFactory,</span></span>
<span class="line"><span>            long suggestedFileSize,</span></span>
<span class="line"><span>            @Nullable SegmentsCache&lt;String&gt; cache) {</span></span>
<span class="line"><span>        super(fileIO, serializer, readerFactory, writerFactory, pathFactory, cache);</span></span>
<span class="line"><span>        this.schemaManager = schemaManager;</span></span>
<span class="line"><span>        this.partitionType = partitionType;</span></span>
<span class="line"><span>        this.writerFactory = writerFactory;</span></span>
<span class="line"><span>        this.suggestedFileSize = suggestedFileSize;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="manifestentry" tabindex="-1">ManifestEntry <a class="header-anchor" href="#manifestentry" aria-label="Permalink to &quot;ManifestEntry&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ManifestEntry implements FileEntry {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final FileKind kind;</span></span>
<span class="line"><span>    // for tables without partition this field should be a row with 0 columns (not null)</span></span>
<span class="line"><span>    /** 文件对应的分区 */</span></span>
<span class="line"><span>    private final BinaryRow partition;</span></span>
<span class="line"><span>    /** 文件对应的bucket */</span></span>
<span class="line"><span>    private final int bucket;</span></span>
<span class="line"><span>    /** 一共多少个桶 */</span></span>
<span class="line"><span>    private final int totalBuckets;</span></span>
<span class="line"><span>    private final DataFileMeta file;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public ManifestEntry(</span></span>
<span class="line"><span>            FileKind kind, BinaryRow partition, int bucket, int totalBuckets, DataFileMeta file) {</span></span>
<span class="line"><span>        this.kind = kind;</span></span>
<span class="line"><span>        this.partition = partition;</span></span>
<span class="line"><span>        this.bucket = bucket;</span></span>
<span class="line"><span>        this.totalBuckets = totalBuckets;</span></span>
<span class="line"><span>        this.file = file;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="datafilemeta" tabindex="-1">DataFileMeta <a class="header-anchor" href="#datafilemeta" aria-label="Permalink to &quot;DataFileMeta&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DataFileMeta {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // Append only data files don&#39;t have any key columns and meaningful level value. it will use</span></span>
<span class="line"><span>    // the following dummy values.</span></span>
<span class="line"><span>    public static final BinaryTableStats EMPTY_KEY_STATS =</span></span>
<span class="line"><span>            new BinaryTableStats(EMPTY_ROW, EMPTY_ROW, BinaryArray.fromLongArray(new Long[0]));</span></span>
<span class="line"><span>    public static final BinaryRow EMPTY_MIN_KEY = EMPTY_ROW;</span></span>
<span class="line"><span>    public static final BinaryRow EMPTY_MAX_KEY = EMPTY_ROW;</span></span>
<span class="line"><span>    public static final int DUMMY_LEVEL = 0;</span></span>
<span class="line"><span>    /** 数据文件名字 */</span></span>
<span class="line"><span>    private final String fileName;</span></span>
<span class="line"><span>    /** 数据文件大小 */</span></span>
<span class="line"><span>    private final long fileSize;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // total number of rows (including add &amp; delete) in this file</span></span>
<span class="line"><span>    /** 此文件中的总行数（包括添加和删除） */</span></span>
<span class="line"><span>    private final long rowCount;</span></span>
<span class="line"><span>    /** 最小键 */</span></span>
<span class="line"><span>    private final BinaryRow minKey;</span></span>
<span class="line"><span>    /** 最大键 */</span></span>
<span class="line"><span>    private final BinaryRow maxKey;</span></span>
<span class="line"><span>    /** 键统计信息 */</span></span>
<span class="line"><span>    private final BinaryTableStats keyStats;</span></span>
<span class="line"><span>    /** 值统计信息 */</span></span>
<span class="line"><span>    private final BinaryTableStats valueStats;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final long minSequenceNumber;</span></span>
<span class="line"><span>    private final long maxSequenceNumber;</span></span>
<span class="line"><span>    /** schemaId*/</span></span>
<span class="line"><span>    private final long schemaId;</span></span>
<span class="line"><span>    /** 级别 */</span></span>
<span class="line"><span>    private final int level;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final List&lt;String&gt; extraFiles;</span></span>
<span class="line"><span>    private final Timestamp creationTime;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // rowCount = addRowCount + deleteRowCount</span></span>
<span class="line"><span>    // Why don&#39;t we keep addRowCount and deleteRowCount?</span></span>
<span class="line"><span>    // Because in previous versions of DataFileMeta, we only keep rowCount.</span></span>
<span class="line"><span>    // We have to keep the compatibility.</span></span>
<span class="line"><span>    /** 删除数据条数 */</span></span>
<span class="line"><span>    private final @Nullable Long deleteRowCount;</span></span>
<span class="line"><span>}</span></span></code></pre></div>`,25)]))}const f=n(i,[["render",l]]);export{u as __pageData,f as default};
