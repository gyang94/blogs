---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "GYang's Blogs"
  text: "大数据学习资料笔记"
  tagline: 顺其自然
  image:
    src: /mountain-river.jpg
    alt: Streaming
  actions:
    - theme: brand
      text: Fluss
      link: /notes/fluss/flink-category
    - theme: alt
      text: Flink
      link: /notes/flink/flink-category
    - theme: alt
      text: Kafka
      link: /notes/kafka/kafka-category

features:
  - title: Fluss
    icon:
      src: /F.svg
    details:
      Fluss 是一种为实时分析而构建的流式存储，可以用作 Lakehouse 架构的实时数据层。
      <br />
      <br />
      持续学习，持续更新中..
      
  - title: Flink
    icon:
      src: /flink.svg
    details: Apache Flink 是一个框架和分布式处理引擎，用于对无界和有界数据流进行有状态计算。Flink 被设计为在所有常见的集群环境中运行，以内存速度和任何规模执行计算。
  - title: Kafka
    icon:
      src: /kafka.svg
    details: Apache Kafka 是一个开源分布式事件流平台，被数千家公司用于高性能数据管道、流分析、数据集成和任务关键型应用程序。
    
---

<VisitorPanel></VisitorPanel>
