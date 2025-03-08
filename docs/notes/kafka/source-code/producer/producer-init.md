---
title: KafkaProducer源码 - 初始化
tags: kafka
outline: 'deep'
---

# KafkaProducer源码 - 初始化 

### <Badge type="tip" text="Kafka" /> <Badge type="tip" text="3.9.0" />

> 此篇介绍原文来自 hsfxuebao 博客 [kafka源码系列](https://juejin.cn/post/7008882455868342285)。原文使用的Kafka版本是0.10.2。本文将代码内容更新到了3.9.0，增加了自己的解读，部份内容也做了修改和补充。

## 1. Kafka Producer 使用

Producer生产者的API使用还是比较简单，先创建一个 `KafkaProducer` 对象，再通过 `ProducerRecord` 对象构建要发送的消息，最后通过 `send()` 方法将消息发出就可以了。

```java
public class ProducerTest {
    private static String topicName;
    private static int msgNum;
    private static int key;

    public static void main(String[] args) {
        Properties props = new Properties();
        props.put("bootstrap.servers", "127.100.0.1:9092,127.100.0.2:9092");
        props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        topicName = "test";
        msgNum = 10; // 发送的消息数

        Producer<String, String> producer = new KafkaProducer<>(props);
        for (int i = 0; i < msgNum; i++) {
            String msg = i + " This is matt's blog.";
            producer.send(new ProducerRecord<String, String>(topicName, msg));
        }
        producer.close();
    }
}
```

## 2. Producer属性

从源码里看一下KafkaProducer的属性。解析标注在注释中。

```java
public class KafkaProducer<K, V> implements Producer<K, V> {

    private final Logger log;
    private static final String JMX_PREFIX = "kafka.producer";
    public static final String NETWORK_THREAD_PREFIX = "kafka-producer-network-thread";
    public static final String PRODUCER_METRIC_GROUP_NAME = "producer-metrics";
    
    // 性能监控相关
	final Metrics metrics;
    private final KafkaProducerMetrics producerMetrics;
    // 生产者客户端的名称
    private String clientId;
    // 分区器
    private final Partitioner partitioner;
    // 消息的最大长度，包含了消息头、序列化后的key和序列化后的value的长度
    private final int maxRequestSize;
    // 发送单个消息的缓冲区大小
    private final long totalMemorySize;
    // 集群元数据信息
    private final ProducerMetadata metadata;
    // 用于存放消息的缓冲
    private final RecordAccumulator accumulator;
    // 发送消息的Sender任务
    private final Sender sender;
    // 发送消息的线程，sender对象会在该线程中运行
    private final Thread ioThread;
    // 压缩算法
    private final Compression compression;
    // 错误记录器
    private final Sensor errors;
    // 用于时间相关操作
    private final Time time;
    // 键和值序列化器
    private final Serializer<K> keySerializer;
    private final Serializer<V> valueSerializer;
    // 生产者配置集
    private final ProducerConfig producerConfig;
    // 等待更新Kafka集群元数据的最大时长
    private final long maxBlockTimeMs;
    // 分区器是否使用record key来分区。如果为true，则不使用hash of key来分区。
    private final boolean partitionerIgnoreKeys;
    // 拦截器集合
    private final ProducerInterceptors<K, V> interceptors;
    private final ApiVersions apiVersions;
    // 事务管理器
    private final TransactionManager transactionManager;
    // 客户端Telemetry报告, 用于报告客户端metrics
    private final Optional<ClientTelemetryReporter> clientTelemetryReporter;
}
```

## 3. Producer初始化

### KafkaProducer 构造器

```java
KafkaProducer(ProducerConfig config,
              Serializer<K> keySerializer,
              Serializer<V> valueSerializer,
              ProducerMetadata metadata,
              KafkaClient kafkaClient,
              ProducerInterceptors<K, V> interceptors,
              Time time) {
    try {
        this.producerConfig = config;
        this.time = time;
				
		// 事务transaction id
        String transactionalId = config.getString(ProducerConfig.TRANSACTIONAL_ID_CONFIG);

		// 获取clientId
        this.clientId = config.getString(ProducerConfig.CLIENT_ID_CONFIG);

		// 初始化Log
        LogContext logContext;
        if (transactionalId == null)
            logContext = new LogContext(String.format("[Producer clientId=%s] ", clientId));
        else
            logContext = new LogContext(String.format("[Producer clientId=%s, transactionalId=%s] ", clientId, transactionalId));
        log = logContext.logger(KafkaProducer.class);
        log.trace("Starting the Kafka producer");

		// Metrics相关初始化
        Map<String, String> metricTags = Collections.singletonMap("client-id", clientId);
        MetricConfig metricConfig = new MetricConfig().samples(config.getInt(ProducerConfig.METRICS_NUM_SAMPLES_CONFIG))
                .timeWindow(config.getLong(ProducerConfig.METRICS_SAMPLE_WINDOW_MS_CONFIG), TimeUnit.MILLISECONDS)
                .recordLevel(Sensor.RecordingLevel.forName(config.getString(ProducerConfig.METRICS_RECORDING_LEVEL_CONFIG)))
                .tags(metricTags);
        List<MetricsReporter> reporters = CommonClientConfigs.metricsReporters(clientId, config);
        this.clientTelemetryReporter = CommonClientConfigs.telemetryReporter(clientId, config);
        this.clientTelemetryReporter.ifPresent(reporters::add);
        MetricsContext metricsContext = new KafkaMetricsContext(JMX_PREFIX,
                config.originalsWithPrefix(CommonClientConfigs.METRICS_CONTEXT_PREFIX));
        this.metrics = new Metrics(metricConfig, reporters, time, metricsContext);
        this.producerMetrics = new KafkaProducerMetrics(metrics);
        
        // 分区器
        this.partitioner = config.getConfiguredInstance(
                ProducerConfig.PARTITIONER_CLASS_CONFIG,
                Partitioner.class,
                Collections.singletonMap(ProducerConfig.CLIENT_ID_CONFIG, clientId));
        warnIfPartitionerDeprecated();
        this.partitionerIgnoreKeys = config.getBoolean(ProducerConfig.PARTITIONER_IGNORE_KEYS_CONFIG);
        // 重试时间
        long retryBackoffMs = config.getLong(ProducerConfig.RETRY_BACKOFF_MS_CONFIG);
        // 重试最大时间
        long retryBackoffMaxMs = config.getLong(ProducerConfig.RETRY_BACKOFF_MAX_MS_CONFIG);
        // 设置序列化器
        if (keySerializer == null) {
            this.keySerializer = config.getConfiguredInstance(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                                                                                     Serializer.class);
            this.keySerializer.configure(config.originals(Collections.singletonMap(ProducerConfig.CLIENT_ID_CONFIG, clientId)), true);
        } else {
            config.ignore(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG);
            this.keySerializer = keySerializer;
        }
        if (valueSerializer == null) {
            this.valueSerializer = config.getConfiguredInstance(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                                                                                       Serializer.class);
            this.valueSerializer.configure(config.originals(Collections.singletonMap(ProducerConfig.CLIENT_ID_CONFIG, clientId)), false);
        } else {
            config.ignore(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG);
            this.valueSerializer = valueSerializer;
        }

		// 设置拦截器
        List<ProducerInterceptor<K, V>> interceptorList = ClientUtils.configuredInterceptors(config,
                ProducerConfig.INTERCEPTOR_CLASSES_CONFIG,
                ProducerInterceptor.class);
        if (interceptors != null)
            this.interceptors = interceptors;
        else
            this.interceptors = new ProducerInterceptors<>(interceptorList);
        ClusterResourceListeners clusterResourceListeners = ClientUtils.configureClusterResourceListeners(
                interceptorList,
                reporters,
                Arrays.asList(this.keySerializer, this.valueSerializer));
        /**
         * MAX_REQUEST_SIZE_CONFIG 生产者往服务端发送一条消息最大的size
         * 默认1m 如果超过这个大小，消息就发送不出去
         */
        this.maxRequestSize = config.getInt(ProducerConfig.MAX_REQUEST_SIZE_CONFIG);
        /**
         * buffer.memory 缓存大小，默认32M
         */
        this.totalMemorySize = config.getLong(ProducerConfig.BUFFER_MEMORY_CONFIG);
        /**
         * kafka可以压缩数据，设置压缩格式
         * 提高系统的吞吐率
         * 一次发送出去的消息越多，生产者需要消耗更多的cpu
         */
        this.compression = configureCompression(config);

        this.maxBlockTimeMs = config.getLong(ProducerConfig.MAX_BLOCK_MS_CONFIG);
        int deliveryTimeoutMs = configureDeliveryTimeout(config, log);

        this.apiVersions = new ApiVersions();
        // 设置事务管理器
        this.transactionManager = configureTransactionState(config, logContext);
        // There is no need to do work required for adaptive partitioning, if we use a custom partitioner.
        boolean enableAdaptivePartitioning = partitioner == null &&
            config.getBoolean(ProducerConfig.PARTITIONER_ADPATIVE_PARTITIONING_ENABLE_CONFIG);
        RecordAccumulator.PartitionerConfig partitionerConfig = new RecordAccumulator.PartitionerConfig(
            enableAdaptivePartitioning,
            config.getLong(ProducerConfig.PARTITIONER_AVAILABILITY_TIMEOUT_MS_CONFIG)
        );
        // As per Kafka producer configuration documentation batch.size may be set to 0 to explicitly disable
        // batching which in practice actually means using a batch size of 1.
        int batchSize = Math.max(1, config.getInt(ProducerConfig.BATCH_SIZE_CONFIG));
        /**
         * 创建RecordAccumulator，它是一个发送消息数据的记录缓冲器，用于批量发送消息数据
         * batch.size单位是字节，默认16k 用于指定达到多少字节批量发送一次
         */
        this.accumulator = new RecordAccumulator(logContext,
                batchSize,
                compression,
                lingerMs(config),
                retryBackoffMs,
                retryBackoffMaxMs,
                deliveryTimeoutMs,
                partitionerConfig,
                metrics,
                PRODUCER_METRIC_GROUP_NAME,
                time,
                apiVersions,
                transactionManager,
                new BufferPool(this.totalMemorySize, batchSize, metrics, time, PRODUCER_METRIC_GROUP_NAME));

        List<InetSocketAddress> addresses = ClientUtils.parseAndValidateAddresses(config);
        /** 创建Metadata集群元数据对象，生产者从服务端拉取kafka元数据信息
         *  需要发送网络请求，重试
         *  metadata.max.age.ms 生产者每隔一段时间更新自己的元数据，默认5分钟
          */
        if (metadata != null) {
            this.metadata = metadata;
        } else {
            this.metadata = new ProducerMetadata(retryBackoffMs,
                    retryBackoffMaxMs,
                    config.getLong(ProducerConfig.METADATA_MAX_AGE_CONFIG),
                    config.getLong(ProducerConfig.METADATA_MAX_IDLE_CONFIG),
                    logContext,
                    clusterResourceListeners,
                    Time.SYSTEM);
            this.metadata.bootstrap(addresses);
        }
        this.errors = this.metrics.sensor("errors");
        // 创建sender
        this.sender = newSender(logContext, kafkaClient, this.metadata);
        /**
         * 创建了一个线程，然后里面传进去了一个sender对象。
         * 把业务的代码和关于线程的代码给隔离开来。
        */
        String ioThreadName = NETWORK_THREAD_PREFIX + " | " + clientId;
        this.ioThread = new KafkaThread(ioThreadName, this.sender, true);
        this.ioThread.start();
        config.logUnused();
        AppInfoParser.registerAppInfo(JMX_PREFIX, clientId, metrics, time.milliseconds());
        log.debug("Kafka producer started");
    } catch (Throwable t) {
        // call close methods if internal objects are already constructed this is to prevent resource leak. see KAFKA-2121
        close(Duration.ofMillis(0), true);
        // now propagate the exception
        throw new KafkaException("Failed to construct kafka producer", t);
    }
}
```

我们先来看一看`KafkaProducer`初始化的时候会涉及到哪些内部的核心组件，默认情况下，一个jvm内部，如果你要是搞多个`KafkaProducer`的话，每个都默认会生成一个client.id，producer-自增长的数字，比如producer-1。

（1）核心组件：`Partitioner` 后面用来决定，你发送的每条消息是路由到Topic的哪个分区里去的

（2）核心组件：`Metadata`，这个是对于生产端来说非常核心的一个组件，他是用来从broker集群去拉取元数据的Topics（Topic -> Partitions（Leader+Followers，ISR）），后面如果写消息到Topic，才知道这个Topic有哪些Partitions，Partition Leader所在的Broker。

后面肯定会每隔一小段时间就再次发送请求刷新元数据，[metadata.max.age.ms](http://metadata.max.age.ms/)，默认是5分钟，默认每隔5分钟一定会强制刷新一下。

还有就是我们猜测，在发送消息的时候，如果发现你要写入的某个Topic对应的元数据不在本地，那么他是不是肯定会通过这个组件，发送请求到broker尝试拉取这个topic对应的元数据，如果你在集群里增加了一台broker，也会涉及到元数据的变化。

（3）核心参数：每个请求的最大大小（1mb），缓冲区的内存大小（32mb），重试时间间隔（100ms），缓冲区填满之后的阻塞时间（60s），请求超时时间（30s）。

（4）核心组件：`RecordAccumulator`，缓冲区，负责消息的复杂的缓冲机制，发送到每个分区的消息会被打包成batch，一个broker上的多个分区对应的多个batch会被打包成一个request，batch size（16kb）

默认情况下，如果光光是考虑batch的机制的话，那么必须要等到足够多的消息打包成一个batch，才能通过request发送到broker上去；但是有一个问题，如果你发送了一条消息，但是等了很久都没有达到一个batch大小。

所以说要设置一个linger.ms，如果在指定时间范围内，都没凑出来一个batch把这条消息发送出去，那么到了这个linger.ms指定的时间，比如说5ms，如果5ms还没凑出来一个batch，那么就必须立即把这个消息发送出去。

（5）核心行为：初始化的时候，直接调用Metadata组件的方法，去broker上拉取了一次集群的元数据过来，后面每隔5分钟会默认刷新一次集群元数据，但是在发送消息的时候，如果没找到某个Topic的元数据，一定也会主动去拉取一次的。

（6）核心组件：网络通信的组件，NetworkClient，一个网络连接最多空闲多长时间（9分钟），每个连接最多有几个request没收到响应（5个），重试连接的时间间隔（50ms），Socket发送缓冲区大小（128kb），Socket接收缓冲区大小（32kb）

（7）核心组件：Sender线程，负责从缓冲区里获取消息发送到broker上去，request最大大小（1mb），acks（1，只要leader写入成功就认为成功），重试次数（0，无重试），请求超时的时间（30s），线程类叫做“KafkaThread”，线程名字叫做“kafka-producer-network-thread”，此处线程直接被启动

（8）核心组件：序列化组件，拦截器组件

### sender线程初始化

```java
/**
 * 创建了一个线程，然后里面传进去了一个sender对象。
 * 把业务的代码和关于线程的代码给隔离开来。
 * 关于线程的这种代码设计的方式，其实也值得大家积累的。
*/
this.ioThread = new KafkaThread(ioThreadName, this.sender, true);

public KafkaThread(final String name, Runnable runnable, boolean daemon) {
    super(runnable, name);
    configureThread(name, daemon);
}

private void configureThread(final String name, boolean daemon) {
    setDaemon(daemon);
    setUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
        public void uncaughtException(Thread t, Throwable e) {
            log.error("Uncaught exception in " + name + ": ", e);
        }
    });
}
```

在设计一些后台线程的时候，可以参照这种模式，把线程以及线程执行的逻辑给切分开来，Sender就是Runnable线程执行的逻辑，KafkaThread其实代表了这个线程本身，线程的名字，未捕获异常的处理，daemon线程的设置后台线程和网络通信的组件要切分开来，线程负责业务逻辑，网络通信组件就专门进行网络请求和响应，封装NIO之类的东西。

- 在设计一些后台线程的时候，可以参照这种模式，把线程以及线程执行的逻辑给切分开来，Sender就是Runnable线程执行的逻辑，KafkaThread其实代表了这个线程本身，线程的名字，未捕获异常的处理，daemon线程的设置。
- 后台线程和网络通信的组件要切分开来，线程负责业务逻辑，网络通信组件就专门进行网络请求和响应，封装NIO之类的东西。

## 小结

本文简单的对`KafkaProducer` 初始化进行简单分析，熟悉了基本的使用方法以及一些参数，了解初始化构造器中的重要步骤，以及sender线程的初始化。