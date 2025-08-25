---
title: File Layouts 2
tags: Paimon
outline: deep
---

# 文件布局-源码

paimon文件内容对应的java源码类。

## Schema

### schema-0

paimon-core模块下：org.apache.paimon.schema.Schema
```
@Public
public class Schema {

    /** paimon表 列字段 */
    private final List<DataField> fields;
    /** paimon表 分区字段 */
    private final List<String> partitionKeys;
    /** paimon表 主键 */
    private final List<String> primaryKeys;
    /** paimon表 opetion 参数 */
    private final Map<String, String> options;
    /** paimon表注释 */
    private final String comment;
    
    }
```

### DataField
paimon-core模块下：org.apache.paimon.schema.DataField
```
@Public
public final class DataField implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final String FIELD_FORMAT_WITH_DESCRIPTION = "%s %s '%s'";

    public static final String FIELD_FORMAT_NO_DESCRIPTION = "%s %s";
    /** 字段id */
    private final int id;
    /** 字段name */
    private final String name;
    /** 字段类型 */
    private final DataType type;
    /** 字段描述 */
    private final @Nullable String description;
}
```

## Snapshot

### snapshot-1
```
@JsonIgnoreProperties(ignoreUnknown = true)
public class Snapshot {

    public static final long FIRST_SNAPSHOT_ID = 1;

    public static final int TABLE_STORE_02_VERSION = 1;
    protected static final int CURRENT_VERSION = 3;

    protected static final String FIELD_VERSION = "version";
    protected static final String FIELD_ID = "id";
    protected static final String FIELD_SCHEMA_ID = "schemaId";
    protected static final String FIELD_BASE_MANIFEST_LIST = "baseManifestList";
    protected static final String FIELD_DELTA_MANIFEST_LIST = "deltaManifestList";
    protected static final String FIELD_CHANGELOG_MANIFEST_LIST = "changelogManifestList";
    protected static final String FIELD_INDEX_MANIFEST = "indexManifest";
    protected static final String FIELD_COMMIT_USER = "commitUser";
    protected static final String FIELD_COMMIT_IDENTIFIER = "commitIdentifier";
    protected static final String FIELD_COMMIT_KIND = "commitKind";
    protected static final String FIELD_TIME_MILLIS = "timeMillis";
    protected static final String FIELD_LOG_OFFSETS = "logOffsets";
    protected static final String FIELD_TOTAL_RECORD_COUNT = "totalRecordCount";
    protected static final String FIELD_DELTA_RECORD_COUNT = "deltaRecordCount";
    protected static final String FIELD_CHANGELOG_RECORD_COUNT = "changelogRecordCount";
    protected static final String FIELD_WATERMARK = "watermark";
    protected static final String FIELD_STATISTICS = "statistics";

    /** 快照版本 */
    @JsonProperty(FIELD_VERSION)
    private final Integer version;

    /** 快照id */
    @JsonProperty(FIELD_ID)
    private final long id;
    /** schema 版本 */
    @JsonProperty(FIELD_SCHEMA_ID)
    private final long schemaId;

    // a manifest list recording all changes from the previous snapshots
    /** 记录与以前快照相比的所有更改的清单列表  */
    @JsonProperty(FIELD_BASE_MANIFEST_LIST)
    private final String baseManifestList;
    /** 一个清单列表，记录此快照中发生的所有新更改，以实现更快的过期和流式读取 */
    @JsonProperty(FIELD_DELTA_MANIFEST_LIST)
    private final String deltaManifestList;
    
    /** 一个清单列表，记录此快照中产生的所有变更日志 */
    @JsonProperty(FIELD_CHANGELOG_MANIFEST_LIST)
    @Nullable
    private final String changelogManifestList;

  /** 记录此表所有索引文件的清单如果没有索引文件，则为null */
    @JsonProperty(FIELD_INDEX_MANIFEST)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String indexManifest;

    @JsonProperty(FIELD_COMMIT_USER)
    private final String commitUser;

    /** 主要用于快照重复数据删除。 */
    @JsonProperty(FIELD_COMMIT_IDENTIFIER)
    private final long commitIdentifier;

    /** 快照中的变化类型。 */
    @JsonProperty(FIELD_COMMIT_KIND)
    private final CommitKind commitKind;

    @JsonProperty(FIELD_TIME_MILLIS)
    private final long timeMillis;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final Map<Integer, Long> logOffsets;

    /** 此快照中发生的所有更改的记录计数 */
    @JsonProperty(FIELD_TOTAL_RECORD_COUNT)
    private final Long totalRecordCount;
    /** 此快照中发生的所有新更改的记录计数 */
    @JsonProperty(FIELD_DELTA_RECORD_COUNT)
    private final Long deltaRecordCount;

    /** 此快照中生成的所有更改日志的记录计数 */
    @JsonProperty(FIELD_CHANGELOG_RECORD_COUNT)
    private final Long changelogRecordCount;

    /** 输入记录的水印 */
    @JsonProperty(FIELD_WATERMARK)
    private final Long watermark;
```

### CommitKind

```
public enum CommitKind {

    /** Changes flushed from the mem table. */
    /** 从内存表（mem table）中刷新出来的变化。   */
    APPEND,

    /** Changes by compacting existing data files. */
    /**
     * 通过压缩现有数据文件产生的变化。
     * 压缩操作可能会合并多个数据文件，删除已删除的记录，
     * 以及优化数据文件的存储结构，此时的变化类型即为COMPACT。
     * */
    COMPACT,

    /** Changes that clear up the whole partition and then add new records. */
    /**
     * 清除整个分区然后添加新记录的变化。
     * 这通常发生在需要对整个分区进行重写或大规模更新时，
     * 此时的变化类型即为OVERWRITE。
     */
    OVERWRITE,

    /** Collect statistics. */
    /**
     * 收集统计信息的变化。
     * 这可能包括对数据的分布、索引的使用情况等进行分析，
     * 以优化查询性能或数据布局，此时的变化类型即为ANALYZE。
     */
    ANALYZE
}
```

## Manifest

### Manifest List

```
public class ManifestList extends ObjectsFile<ManifestFileMeta> {

    private ManifestList(
            FileIO fileIO,
            ManifestFileMetaSerializer serializer,
            FormatReaderFactory readerFactory,
            FormatWriterFactory writerFactory,
            PathFactory pathFactory,
            @Nullable SegmentsCache<String> cache) {
        super(fileIO, serializer, readerFactory, writerFactory, pathFactory, cache);
    }
    }
```

### ManifestFileMeta

```
public class ManifestFileMeta {

    private static final Logger LOG = LoggerFactory.getLogger(ManifestFileMeta.class);
    /** manifest文件名 */
    private final String fileName;
    /** manifest文件大小 */
    private final long fileSize;
    /** 添加的文件数量 */
    private final long numAddedFiles;
    /** 删除的文件数量 */
    private final long numDeletedFiles;
    /** 分区统计信息 */
    private final BinaryTableStats partitionStats;
    /** schameId */
    private final long schemaId;
}
```

### ManifestFile
```
public class ManifestFile extends ObjectsFile<ManifestEntry> {

    private final SchemaManager schemaManager;
    private final RowType partitionType;
    private final FormatWriterFactory writerFactory;
    private final long suggestedFileSize;

    private ManifestFile(
            FileIO fileIO,
            SchemaManager schemaManager,
            RowType partitionType,
            ManifestEntrySerializer serializer,
            FormatReaderFactory readerFactory,
            FormatWriterFactory writerFactory,
            PathFactory pathFactory,
            long suggestedFileSize,
            @Nullable SegmentsCache<String> cache) {
        super(fileIO, serializer, readerFactory, writerFactory, pathFactory, cache);
        this.schemaManager = schemaManager;
        this.partitionType = partitionType;
        this.writerFactory = writerFactory;
        this.suggestedFileSize = suggestedFileSize;
    }
}
```

### ManifestEntry

```
public class ManifestEntry implements FileEntry {

    private final FileKind kind;
    // for tables without partition this field should be a row with 0 columns (not null)
    /** 文件对应的分区 */
    private final BinaryRow partition;
    /** 文件对应的bucket */
    private final int bucket;
    /** 一共多少个桶 */
    private final int totalBuckets;
    private final DataFileMeta file;

    public ManifestEntry(
            FileKind kind, BinaryRow partition, int bucket, int totalBuckets, DataFileMeta file) {
        this.kind = kind;
        this.partition = partition;
        this.bucket = bucket;
        this.totalBuckets = totalBuckets;
        this.file = file;
    }
}
```

### DataFileMeta

```
public class DataFileMeta {

    // Append only data files don't have any key columns and meaningful level value. it will use
    // the following dummy values.
    public static final BinaryTableStats EMPTY_KEY_STATS =
            new BinaryTableStats(EMPTY_ROW, EMPTY_ROW, BinaryArray.fromLongArray(new Long[0]));
    public static final BinaryRow EMPTY_MIN_KEY = EMPTY_ROW;
    public static final BinaryRow EMPTY_MAX_KEY = EMPTY_ROW;
    public static final int DUMMY_LEVEL = 0;
    /** 数据文件名字 */
    private final String fileName;
    /** 数据文件大小 */
    private final long fileSize;

    // total number of rows (including add & delete) in this file
    /** 此文件中的总行数（包括添加和删除） */
    private final long rowCount;
    /** 最小键 */
    private final BinaryRow minKey;
    /** 最大键 */
    private final BinaryRow maxKey;
    /** 键统计信息 */
    private final BinaryTableStats keyStats;
    /** 值统计信息 */
    private final BinaryTableStats valueStats;

    private final long minSequenceNumber;
    private final long maxSequenceNumber;
    /** schemaId*/
    private final long schemaId;
    /** 级别 */
    private final int level;

    private final List<String> extraFiles;
    private final Timestamp creationTime;

    // rowCount = addRowCount + deleteRowCount
    // Why don't we keep addRowCount and deleteRowCount?
    // Because in previous versions of DataFileMeta, we only keep rowCount.
    // We have to keep the compatibility.
    /** 删除数据条数 */
    private final @Nullable Long deleteRowCount;
}
```