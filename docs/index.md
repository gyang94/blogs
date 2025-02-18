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
      text: Flink
      link: /notes/flink/flink-menu
    - theme: alt
      text: Kafka
      link: /notes/kafka/kafka-menu

features:
  - title: Fluss
    icon:
      src: /F.svg
    details: Fluss is a streaming storage built for real-time analytics which can serve as the real-time data layer for Lakehouse architectures.
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
