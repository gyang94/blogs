---
title: Fluss Catalog
tags: fluss
outline: deep
---

# Fluss Catalog

在上一篇 [搭建Fluss本地开发环境](./01-development-env-setup.md) 中我们成功搭建了Fluss本地的运行环境并启动了集群，接下来尝试通过flink创建Fluss Catalog。

## Flink环境准备

在Flink官网上下载Flink包，此处以flink-1.20.0版本为例，解压后运行命令启动flink集群以及SQL client。

```bash
# 启动flink集群
flink-1.20.0/bin/start-cluster.sh

# 启动SQL Client
flink-1.20.0/bin/sql-client.sh
```

## 创建Fluss Catalog

在SQL Client中运行DDL创建Fluss Catalog。

```bash
CREATE CATALOG fluss_catalog WITH (
  'type' = 'fluss',
  'bootstrap.servers' = 'fluss-server-1:9123'
);

USE CATALOG fluss_catalog;
```

创建成功后接下来，就可以通过catalog去访问fluss的数据内容了。

## Fluss Catalog源码

在Fluss的源码中，Catalog的实现类是 `FlinkCatalog` , 它继承了标准的Flink的Catalog接口，实现了接口的方法，从而能够完成对Fluss集群的访问操作。

```java
/** A Flink Catalog for fluss. */
public class FlinkCatalog implements Catalog {

    protected final String catalogName;
    protected final @Nullable String defaultDatabase;
    protected final String bootstrapServers;
    
    protected Connection connection;
    protected Admin admin;

    private volatile @Nullable LakeCatalog lakeCatalog;
    
    ...
}
```

类里面总共只有6个属性，其中 `catalogName` , `defaultDatabase`，以及 `bootstrapServers`分别用来记录catalog的名称，默认数据库名称，以及链接的Fluss集群地址。这三个属性比较直观，不再赘述。

比较重要剩下三个属性 `connection` ， `admin` 以及 `lakeCatalog` 。他们主要负责与Fluss集群沟通，完成相应的数据操作。

### Connection

Connection是一个接口，抽象表示了一个与Fluss集群的链接。Admin也是一个接口，用来抽象表示一个管理员Client客户端，它能够对集群做一些管理员操作。

```java
public interface Connection extends AutoCloseable {

    /** Retrieve the configuration used to create this connection. */
    Configuration getConfiguration();

    /** Retrieve a new Admin client to administer a Fluss cluster. */
    Admin getAdmin();

    /** Retrieve a new Table client to operate data in table. */
    Table getTable(TablePath tablePath);

    /** Close the connection and release all resources. */
    @Override
    void close() throws Exception;
}
```

Connection接口只有一个实现类，叫 `FlussConnection` 。类里面属性很多，有各种不同的Client，如RpcClient, WriterClient以及LookupClient。MetadataUpdater用来维护metadata数据。还有用于remote文件操作的RemoteFileDownloader，以及与metrics相关的MetricsRegistry和ClientMetricGroup。

```java
public final class FlussConnection implements Connection {
    private final Configuration conf;
    private final RpcClient rpcClient;
    private final MetadataUpdater metadataUpdater;
    private final MetricRegistry metricRegistry;
    private final ClientMetricGroup clientMetricGroup;

    private volatile WriterClient writerClient;
    private volatile LookupClient lookupClient;
    private volatile RemoteFileDownloader remoteFileDownloader;
    private volatile SecurityTokenManager securityTokenManager;
    
    ...    
}
```

这里我们先不详细研究其中的每一个组件。现在大致了解FlussConnection的组成之后，先暂时知道它是用来与Fluss交流的核心的类就可以了。

### Admin

Admin也是一个接口，它表示一个管理员Client，用来管理操作Fluss集群的数据，表，配置以及ACL等等。

其中定义了很多方法，诸如 createDatabase, listDatabase, getTableSchema等等。

```java
public interface Admin extends AutoCloseable {
	CompletableFuture<SchemaInfo> getTableSchema(TablePath tablePath);
	CompletableFuture<Void> createDatabase(
            String databaseName, DatabaseDescriptor databaseDescriptor, boolean ignoreIfExists);
	...
}
```

Admin接口有一个实现类 `FlussAdmin`, 只有三个属性，其中AdminGateway承担了与集群的沟通工作。

```java
public class FlussAdmin implements Admin {
    private final AdminGateway gateway;
    private final MetadataUpdater metadataUpdater;
    private final RpcClient client;
}
```

在FlussConnection中，Admin Client由 `getAdmin()` 方法创建。

```java
@Override
public Admin getAdmin() {
    return new FlussAdmin(rpcClient, metadataUpdater);
}
```

### Catalog方法实现

Fluss Catalog中实现Catalog接口的方法主要依赖于Admin，这里我们以 `listDatabases()` 方法为例，几乎都是通过调用admin client的对应方法来实现catalog的功能。

```java
@Override
public List<String> listDatabases() throws CatalogException {
    try {
        return admin.listDatabases().get();
    } catch (Exception e) {
        throw new CatalogException(
                String.format("Failed to list all databases in %s", getName()),
                ExceptionUtils.stripExecutionException(e));
    }
}
```

几乎所有的Catalog方法都是这种实现方式，将真正的功能委托给了Admin Client。

在Catelog中，Admin在 `open()` 方法中通过Connection创建。

```java
/** In FlinkCatalog **/
@Override
public void open() throws CatalogException {
    Configuration flussConfigs = new Configuration();
    flussConfigs.setString(ConfigOptions.BOOTSTRAP_SERVERS.key(), bootstrapServers);
    connection = ConnectionFactory.createConnection(flussConfigs);
    admin = connection.getAdmin();
}
```

### LakeCatalog

Fluss架构里数据会存在Remote Storage里，要去访问数据湖里的数据，就需要创建湖结构的Catalog。lakeCatalog就是用来访问湖中的表。

```java
protected CatalogBaseTable getLakeTable(String databaseName, String tableName)
            throws TableNotExistException, CatalogException {
    mayInitLakeCatalogCatalog();
    String[] tableComponents = tableName.split("\\" + LAKE_TABLE_SPLITTER);
    if (tableComponents.length == 1) {
        // should be pattern like table_name$lake
        tableName = tableComponents[0];
    } else {
        // be some thing like table_name$lake$snapshot
        tableName = String.join("", tableComponents);
    }
    return lakeCatalog.getTable(new ObjectPath(databaseName, tableName));
}
```

在Fluss中有一个 `getLakeTable()` 方法，通过lakeCatalog去访问湖中数据。

## 小结

这篇文章创建了Fluss Catalog，并通过源码简单了解了Fluss Catalog的实现，主要是通过调用Admin的相应方法实现Catalog的功能。