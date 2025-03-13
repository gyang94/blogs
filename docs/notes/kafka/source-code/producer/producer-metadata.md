---
title: KafkaProducer源码 - 元数据更新 
tags: kafka
outline: 'deep'
---

# KafkaProducer源码 - 元数据更新

### <Badge type="tip" text="Kafka" /> <Badge type="tip" text="3.9.0" />

> 此篇介绍原文来自 hsfxuebao 博客 [kafka源码系列](https://juejin.cn/post/7008882455868342285)。原文使用的Kafka版本是0.10.2。本文将代码内容更新到了3.9.0，增加了自己的解读，部份内容也做了修改和补充。

在上一篇文章中，已经介绍了 Producer 的发送模型，Producer `dosend()` 方法中的第一步，就是获取相关的 topic 的 metadata，但在上篇中并没有深入展开，因为这部分的内容比较多，所以本文单独一篇文章进行介绍，本文主要来讲述以下三个问题：

1. metadata 内容是什么；
2. Producer 更新 metadata 的流程；
3. Producer 在什么情况下会去更新 metadata；

## Metadata内容

在KafkaProducer中，有一个叫 `metadata`的field，它是一个 `ProducerMetadata` 对象，继承自 `Metadata` 类。

先看看`Metadata` 类中的属性

```java
public class Metadata implements Closeable {
    private final Logger log;
    //两个更新元数据的请求的最小的时间间隔
    private final ExponentialBackoff refreshBackoff;
    // 多久自动更新一次元数据，默认值是5分钟更新一次。
    private final long metadataExpireMs;
    // 集群元数据版本号，元数据更新成功一次，版本号就自增1
    private int updateVersion;  // bumped on every metadata response
    private int requestVersion; // bumped on every new topic addition
    // 上一次更新元数据的时间戳
    private long lastRefreshMs;
    /**
     * 上一次成功更新元数据的时间戳，如果每次更新都成功，
     * lastSuccessfulRefreshMs应该与lastRefreshMs相同，否则lastRefreshMs > lastSuccessfulRefreshMs
     */
    private long lastSuccessfulRefreshMs;
    private long attempts;
    private KafkaException fatalException;
    private Set<String> invalidTopics;
    private Set<String> unauthorizedTopics;
    // 集群metadata元数据信息
    private volatile MetadataSnapshot metadataSnapshot = MetadataSnapshot.empty();
    // 表示是否强制更新
    private boolean needFullUpdate;
    private boolean needPartialUpdate;
    private long equivalentResponseCount;
    // 当接收到 metadata 更新时, ClusterResourceListeners的列表
    private final ClusterResourceListeners clusterResourceListeners;
    private boolean isClosed;
    private final Map<TopicPartition, Integer> lastSeenLeaderEpochs;
    /** Addresses with which the metadata was originally bootstrapped. */
    private List<InetSocketAddress> bootstrapAddresses;
}
```

其中 `MetadataSnapshot` 是真正存储元数据信息的对象, 属性如下

```java
public class MetadataSnapshot {
    private final String clusterId;
    // Kafka集群中的broker节点集合，这个参数代表的就是kafka的服务器的信息。
    private final Map<Integer, Node> nodes;
    // 未授权的主题集合
    private final Set<String> unauthorizedTopics;
    // invalid topic 集合
    private final Set<String> invalidTopics;
    // 内置的 topic 集合
    private final Set<String> internalTopics;
    // controller node
    private final Node controller;
    // topic对应的partition信息字典，键为topic名称，值为partition信息集合；存放的partition不一定有Leader副本
    private final Map<TopicPartition, PartitionMetadata> metadataByPartition;
    private final Map<String, Uuid> topicIds;
    private final Map<Uuid, String> topicNames;
    private Cluster clusterInstance;
}
```

## Producer的Metadata更新流程

Producer在调用doSend()方法时，第一步就是通过 `waitOnMetadata` 方法获取topic的metadata信息。

```java
private ClusterAndWaitTime waitOnMetadata(String topic, Integer partition, long nowMs, long maxWaitMs) throws InterruptedException {
    
    //我们使用的是场景驱动的方式，然后我们目前代码执行到的producer端初始化完成。
    //我们知道这个cluster里面其实没有元数据，只有我们写代码的时候设置address
    Cluster cluster = metadata.fetch();

    if (cluster.invalidTopics().contains(topic))
        throw new InvalidTopicException(topic);

    // add topic to metadata topic list if it is not there already and reset expiry
    // 把当前的topic存入到元数据里面
    metadata.add(topic, nowMs);

		//根据当前的topic从这个集群的cluster元数据信息里面查看分区的信息。
    //因为我们目前是第一次执行这段代码，所以这儿肯定是没有对应的分区的信息的。
    Integer partitionsCount = cluster.partitionCountForTopic(topic);
    // Return cached metadata if we have it, and if the record's partition is either undefined
    // or within the known partition range
    //如果在元数据里面获取到了 分区的信息
    //我们用场景驱动的方式，我们知道如果是第一次代码进来这儿，代码是不会运行这儿。
    if (partitionsCount != null && (partition == null || partition < partitionsCount))
        //直接返回cluster元数据信息，拉取元数据花的时间。
        return new ClusterAndWaitTime(cluster, 0);

		// 如果代码执行到这儿，说明，真的需要去服务端拉取元数据。
    // 剩余多少时间，默认值给的是 最多可以等待的时间。
    long remainingWaitMs = maxWaitMs;
    // 已经花了多少时间。
    long elapsed = 0;
    // Issue metadata requests until we have metadata for the topic and the requested partition,
    // or until maxWaitTimeMs is exceeded. This is necessary in case the metadata
    // is stale and the number of partitions for this topic has increased in the meantime.
    // 已经花了多少时间。
    long nowNanos = time.nanoseconds();
    
    // Issue metadata requests until we have metadata for the topic or maxWaitTimeMs is exceeded.
    // In case we already have cached metadata for the topic, but the requested partition is greater
    // than expected, issue an update request only once. This is necessary in case the metadata
    // is stale and the number of partitions for this topic has increased in the meantime.
    // 如果没有拉取到相应主题的元数据，将会重复拉取
    do {
        if (partition != null) {
            log.trace("Requesting metadata update for partition {} of topic {}.", partition, topic);
        } else {
            log.trace("Requesting metadata update for topic {}.", topic);
        }
        metadata.add(topic, nowMs + elapsed);
        //1)获取当前元数据的版本
        //在Producer管理元数据时候，对于他来说元数据是有版本号的。
        //每次成功更新元数据，都会递增这个版本号。
        //把needUpdate 标识赋值为true
        int version = metadata.requestUpdateForTopic(topic);
	       /**
	       * TODO 这个步骤重要
	       * 我们发现这儿去唤醒sender线程。
	       * 其实是因为，拉取元数据这个操作是有sender线程去完成的。
	       * 我们知道sender线程肯定就开始进行干活了！！ 至于怎么我们后面在继续分析。
	       */
        sender.wakeup();
        try {
		        //同步的等待
            //等待这sender线程获取到元数据。
            metadata.awaitUpdate(version, remainingWaitMs);
        } catch (TimeoutException ex) {
            // Rethrow with original maxWaitMs to prevent logging exception with remainingWaitMs
            final String errorMessage = getErrorMessage(partitionsCount, topic, partition, maxWaitMs);
            if (metadata.getError(topic) != null) {
                throw new TimeoutException(errorMessage, metadata.getError(topic).exception());
            }
            throw new TimeoutException(errorMessage);
        }
        // 尝试获取一下集群的元数据信息。
        cluster = metadata.fetch();
        // 计算一下 拉取元数据已经花了多少时间
        elapsed = time.milliseconds() - nowMs;
        // 等待超过最大超时时间，直接抛出异常
        if (elapsed >= maxWaitMs) {
            final String errorMessage = getErrorMessage(partitionsCount, topic, partition, maxWaitMs);
            if (metadata.getError(topic) != null && metadata.getError(topic).exception() instanceof RetriableException) {
                throw new TimeoutException(errorMessage, metadata.getError(topic).exception());
            }
            throw new TimeoutException(errorMessage);
        }
        metadata.maybeThrowExceptionForTopic(topic);
        //计算出来 还可以用的时间。
        remainingWaitMs = maxWaitMs - elapsed;
        //尝试获取一下，我们要发送消息的这个topic对应分区的信息。
        //如果这个值不为null，说明前面sender线程已经获取到了元数据了。
        partitionsCount = cluster.partitionCountForTopic(topic);
    } while (partitionsCount == null || (partition != null && partition >= partitionsCount));

    producerMetrics.recordMetadataWait(time.nanoseconds() - nowNanos);

		// 返回一个对象
    return new ClusterAndWaitTime(cluster, elapsed);
}
```

如果 metadata 中不存在这个 topic 的 metadata，那么就请求更新 metadata，如果 metadata 没有更新的话，方法就一直处在 `do ... while` 的循环之中，在循环之中，主要做以下操作：

1. `metadata.requestUpdate()` 将 metadata 的 `needUpdate` 变量设置为 true（强制更新），并返回当前的版本号（version），通过版本号来判断 metadata 是否完成更新；
2. `sender.wakeup()` 唤醒 sender 线程，sender 线程又会去唤醒 `NetworkClient` 线程，`NetworkClient` 线程进行一些实际的操作（后面详细介绍）；
3. `metadata.awaitUpdate(version, remainingWaitMs)` 等待 metadata 的更新。

```java

// 等待metadata更新，直到当前的version大于上一次记录的version，或者超时。
public synchronized void awaitUpdate(final int lastVersion, final long timeoutMs) throws InterruptedException {
    long currentTimeMs = time.milliseconds();
    long deadlineMs = currentTimeMs + timeoutMs < 0 ? Long.MAX_VALUE : currentTimeMs + timeoutMs;
    time.waitObject(this, () -> {
        // Throw fatal exceptions, if there are any. Recoverable topic errors will be handled by the caller.
        maybeThrowFatalException();
        return updateVersion() > lastVersion || isClosed();
    }, deadlineMs);

    if (isClosed())
        throw new KafkaException("Requested metadata update after close");
}
```

从前面可以看出，此时 Producer 线程会阻塞等待一段时间，直到 metadata 信息更新，那么 metadata 是如何更新的呢？如果有印象的话，前面应该已经介绍过了，主要是通过 `sender.wakeup()` 来唤醒 sender 线程，间接唤醒 NetworkClient 线程，NetworkClient 线程来负责发送 Metadata 请求，并处理 Server 端的响应。

在Sender的run()方法中，最后一行调用了client.poll()方法

```java
client.poll(pollTimeout, currentTimeMs);
```

这个client是一个 `KafkaClient` ，实现类是 `NetworkClient` , 更新metadata的步骤就发生在 `NetworkClient.poll()` 方法里。

```java
public List<ClientResponse> poll(long timeout, long now) {
    ensureActive();

    if (!abortedSends.isEmpty()) {
        // If there are aborted sends because of unsupported version exceptions or disconnects,
        // handle them immediately without waiting for Selector#poll.
        List<ClientResponse> responses = new ArrayList<>();
        handleAbortedSends(responses);
        completeResponses(responses);
        return responses;
    }

		//步骤一：封装了一个要拉取元数据请求
    long metadataTimeout = metadataUpdater.maybeUpdate(now);
    long telemetryTimeout = telemetrySender != null ? telemetrySender.maybeUpdate(now) : Integer.MAX_VALUE;
    try {
		    //步骤二： 发送请求，进行复杂的网络操作
        this.selector.poll(Utils.min(timeout, metadataTimeout, telemetryTimeout, defaultRequestTimeoutMs));
    } catch (IOException e) {
        log.error("Unexpected error during I/O", e);
    }

    // process completed actions
    long updatedNow = this.time.milliseconds();
    List<ClientResponse> responses = new ArrayList<>();
    //步骤三：处理响应，响应里面就会有我们需要的元数据。
    handleCompletedSends(responses, updatedNow);
    /**
     * 这个地方是我们在看生产者是如何获取元数据的时候，看的。
     * 其实Kafak获取元数据的流程跟我们发送消息的流程是一模一样。
     * 获取元数据 -> 判断网络连接是否建立好 -> 建立网络连接
     * -> 发送请求（获取元数据的请求） -> 服务端发送回来响应（带了集群的元数据信息）
     */
    handleCompletedReceives(responses, updatedNow);
    handleDisconnections(responses, updatedNow);
    handleConnections();
    handleInitiateApiVersionRequests(updatedNow);
    handleTimedOutConnections(responses, updatedNow);
    //处理超时的请求
    handleTimedOutRequests(responses, updatedNow);
    //responses里封装了callback函数，这个方法是调用callback回调函数
    completeResponses(responses);

    return responses;
}
```

在这个方法中，主要会以下操作：

- `metadataUpdater.maybeUpdate(now)`：判断是否需要更新 Metadata，如果需要更新的话，先与 Broker 建立连接，然后发送更新 metadata 的请求；
- 处理 Server 端的一些响应，这里主要讨论的是 `handleCompletedReceives(responses, updatedNow)` 方法，它会处理 Server 端返回的 Metadata 结果。

## **封装请求**

先看一下 `metadataUpdater.maybeUpdate()` 的具体实现：

```java
public long maybeUpdate(long now) {
    // should we update our metadata?
    long timeToNextMetadataUpdate = metadata.timeToNextUpdate(now);
    long waitForMetadataFetch = hasFetchInProgress() ? defaultRequestTimeoutMs : 0;

    long metadataTimeout = Math.max(timeToNextMetadataUpdate, waitForMetadataFetch);
    if (metadataTimeout > 0) {
        return metadataTimeout;
    }

    // Beware that the behavior of this method and the computation of timeouts for poll() are
    // highly dependent on the behavior of leastLoadedNode.
    LeastLoadedNode leastLoadedNode = leastLoadedNode(now);

    // Rebootstrap if needed and configured.
    if (metadataRecoveryStrategy == MetadataRecoveryStrategy.REBOOTSTRAP
            && !leastLoadedNode.hasNodeAvailableOrConnectionReady()) {
        metadata.rebootstrap();

        leastLoadedNode = leastLoadedNode(now);
    }

    if (leastLoadedNode.node() == null) {
        log.debug("Give up sending metadata request since no node is available");
        return reconnectBackoffMs;
    }

    return maybeUpdate(now, leastLoadedNode.node());
}

private long maybeUpdate(long now, Node node) {
    String nodeConnectionId = node.idString();

		//判断网络连接是否应建立好
    if (canSendRequest(nodeConnectionId, now)) {
        Metadata.MetadataRequestAndVersion requestAndVersion = metadata.newMetadataRequestAndVersion(now);
        // 封装metadata请求
        MetadataRequest.Builder metadataRequest = requestAndVersion.requestBuilder;
        log.debug("Sending metadata request {} to node {}", metadataRequest, node);
        // 发送metadata请求
        sendInternalMetadataRequest(metadataRequest, nodeConnectionId, now);
        inProgress = new InProgressData(requestAndVersion.requestVersion, requestAndVersion.isPartialUpdate);
        return defaultRequestTimeoutMs;
    }

		...
}

```

封装请求的结构是 `MetadataRequest.Builder` 

```java
public Builder(List<String> topics, boolean allowAutoTopicCreation, short minVersion, short maxVersion) {
    super(ApiKeys.METADATA, minVersion, maxVersion);
    MetadataRequestData data = new MetadataRequestData();
    if (topics == null)
        data.setTopics(null);
    else {
        topics.forEach(topic -> data.topics().add(new MetadataRequestTopic().setName(topic)));
    }

    data.setAllowAutoTopicCreation(allowAutoTopicCreation);
    this.data = data;
}
```

它会去请求传入的topic list中的每一个topic的metadata。而这个topic list一般默认为allTopics

```java
protected MetadataRequest.Builder newMetadataRequestBuilder() {
    return MetadataRequest.Builder.allTopics();
}
```

所以，每次 Producer 请求更新 metadata 时，会有以下几种情况：

1. 如果 node 可以发送请求，则直接发送请求；
2. 如果该 node 正在建立连接，则直接返回；
3. 如果该 node 还没建立连接，则向 broker 初始化链接。

而 KafkaProducer 线程之前是一直阻塞，直到 metadata 更新

1. sender 线程第一次调用 `poll()` 方法时，初始化与 node 的连接；
2. sender 线程第二次调用 `poll()` 方法时，发送 `Metadata` 请求；
3. sender 线程第三次调用 `poll()` 方法时，获取 `metadataResponse`，并更新 metadata。

经过上述 sender 线程三次调用 `poll()`方法，所请求的 metadata 信息才会得到更新，此时 Producer 线程也不会再阻塞，开始发送消息。

## 服务端处理元数据请求

也就是我们封装了一个ApiKeys.METADATA的请求，然后在kafka服务端进行处理。在Kafka服务端 `KafkaApis.handle(）` 方法中，有一个case是接收metadata请求并handle

```java
case ApiKeys.METADATA => handleTopicMetadataRequest(request)
```

## **Producer 处理元数据响应**

`NetworkClient` 接收到 Server 端对 Metadata 请求的响应后，更新 Metadata 信息。

```java
private void handleCompletedReceives(List<ClientResponse> responses, long now) {
    for (NetworkReceive receive : this.selector.completedReceives()) {
		    //获取broker id
        String source = receive.source();
        /**
         * kafka 有这样的一个机制：每个连接可以容忍5个发送出去了(参数配置)，但是还没接收到响应的请求。
         */
        //从数据结构里面移除已经接收到响应的请求。
        //把之前存入进去的请求也获取到了
        InFlightRequest req = inFlightRequests.completeNext(source);
				//解析服务端发送回来的请求（里面有响应的结果数据）
        AbstractResponse response = parseResponse(receive.payload(), req.header);
        if (throttleTimeSensor != null)
            throttleTimeSensor.record(response.throttleTimeMs(), now);

        if (log.isDebugEnabled()) {
            log.debug("Received {} response from node {} for request with header {}: {}",
                req.header.apiKey(), req.destination, req.header, response);
        }

        // If the received response includes a throttle delay, throttle the connection.
        maybeThrottle(response, req.header.apiVersion(), req.destination, now);
        if (req.isInternalRequest && response instanceof MetadataResponse)
			      //解析完了以后就把封装成一个一个的clientResponse
            //body 存储的是响应的内容
            //req 发送出去的那个请求信息
            metadataUpdater.handleSuccessfulResponse(req.header, now, (MetadataResponse) response);
        else if (req.isInternalRequest && response instanceof ApiVersionsResponse)
            handleApiVersionsResponse(responses, req, now, (ApiVersionsResponse) response);
        else if (req.isInternalRequest && response instanceof GetTelemetrySubscriptionsResponse)
            telemetrySender.handleResponse((GetTelemetrySubscriptionsResponse) response);
        else if (req.isInternalRequest && response instanceof PushTelemetryResponse)
            telemetrySender.handleResponse((PushTelemetryResponse) response);
        else
            responses.add(req.completed(response, now));
    }
}
```

其中处理metadata response的步骤在 `metadataUpdater.handleSuccessfulResponse()` 中。

```java
public void handleSuccessfulResponse(RequestHeader requestHeader, long now, MetadataResponse response) {
    // If any partition has leader with missing listeners, log up to ten of these partitions
    // for diagnosing broker configuration issues.
    // This could be a transient issue if listeners were added dynamically to brokers.
    List<TopicPartition> missingListenerPartitions = response.topicMetadata().stream().flatMap(topicMetadata ->
        topicMetadata.partitionMetadata().stream()
            .filter(partitionMetadata -> partitionMetadata.error == Errors.LISTENER_NOT_FOUND)
            .map(partitionMetadata -> new TopicPartition(topicMetadata.topic(), partitionMetadata.partition())))
        .collect(Collectors.toList());
    if (!missingListenerPartitions.isEmpty()) {
        int count = missingListenerPartitions.size();
        log.warn("{} partitions have leader brokers without a matching listener, including {}",
                count, missingListenerPartitions.subList(0, Math.min(10, count)));
    }

    // Check if any topic's metadata failed to get updated
    Map<String, Errors> errors = response.errors();
    if (!errors.isEmpty())
        log.warn("The metadata response from the cluster reported a recoverable issue with correlation id {} : {}", requestHeader.correlationId(), errors);

    // When talking to the startup phase of a broker, it is possible to receive an empty metadata set, which
    // we should retry later.
    if (response.brokers().isEmpty()) {
        log.trace("Ignoring empty metadata response with correlation id {}.", requestHeader.correlationId());
        this.metadata.failedUpdate(now);
    } else {
    // //更新元数据信息。
        this.metadata.update(inProgress.requestVersion, response, inProgress.isPartialUpdate, now);
    }

    inProgress = null;
}
```

## Producer更新策略

Metadata 会在下面两种情况下进行更新

1. KafkaProducer 第一次发送消息时强制更新，其他时间周期性更新，它会通过 Metadata 的 `lastRefreshMs`, `lastSuccessfulRefreshMs` 这2个字段来实现；
2. 强制更新： 调用 `Metadata.requestUpdate()` 将 `needUpdate` 置成了 true 来强制更新。

在 NetworkClient 的 `poll()` 方法调用时，就会去检查这两种更新机制，只要达到其中一种，就行触发更新操作。

Metadata 的强制更新会在以下几种情况下进行：

1. `initConnect` 方法调用时，初始化连接；
2. `poll()` 方法中对 `handleDisconnections()` 方法调用来处理连接断开的情况，这时会触发强制更新；
3. `poll()` 方法中对 `handleTimedOutRequests()` 来处理请求超时时；
4. 发送消息时，如果无法找到 partition 的 leader；
5. 处理 Producer 响应（`handleProduceResponse`），如果返回关于 Metadata 过期的异常，比如：没有 topic-partition 的相关 meta 或者 client 没有权限获取其 metadata。

强制更新主要是用于处理各种异常情况。

## 小结

本篇文章主要分析元数据的更新操作。Producer会维护一个metadata元数据对象，这个元数据对象的更新是通过sender线程里NetworkClient.poll()方法完成的。其中它发送了metadata请求并处理更新了kafka server的返回。