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
      
    link: 
  - title: Flink
    icon:
      src: /flink.svg
    details: Apache Flink is a framework and distributed processing engine for stateful computations over unbounded and bounded data streams. Flink has been designed to run in all common cluster environments, perform computations at in-memory speed and at any scale.
  - title: Kafka
    icon:
      src: /kafka.svg
    details: Apache Kafka is an open-source distributed event streaming platform used by thousands of companies for high-performance data pipelines, streaming analytics, data integration, and mission-critical applications.
    
---

<VisitorPanel></VisitorPanel>
