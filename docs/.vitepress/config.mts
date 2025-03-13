import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/blogs/',

  title: "GYang's Blogs",
  description: "顺其自然的学习小屋",

  head: [
    ["link", { rel: "icon", href: "/blog.svg" }],
    [
      "script",
      {
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "a389c094-c38f-4892-a805-600abb846e29",
      },
    ],
  ],

  lastUpdated: true,

  themeConfig: {
    logo: '/data-lake.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '学习笔记', 
        items: [
          { text: 'Fluss', link: '/notes/fluss/fluss-category' },
          { text: 'Flink', link: '/notes/flink/flink-category' },
          { text: 'Kafka', link: '/notes/kafka/kafka-category' },
        ]
      },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/notes/fluss/': [
        { 
            text: 'Fluss学习笔记', 
            link: '/notes/fluss/fluss-category',
            collapsed: true,
            items: [
              { text: '01-搭建Fluss本地开发环境', link: '/notes/fluss/01-development-env-setup' },
              { text: '02-Fluss Catalog', link: '/notes/fluss/02-fluss-catalog' },

            ]
        }
      ],
      '/notes/kafka/': [
        { 
            text: 'Kafka学习笔记', 
            link: '/notes/kafka/kafka-category',
            collapsed: true,
            items: [
              { text: '01-kafka简介', link: '/notes/kafka/01-intro' },
              { text: '02-kafka命令合集', link: '/notes/kafka/02-kafka-cli' },
              { text: 'Kafka源码系列', items: [
                  {
                    text: 'Producer', collapsed: true, items: [
                      { text: 'KafkaProducer源码 - 初始化', link: '/notes/kafka/source-code/producer/producer-init' },
                      { text: 'KafkaProducer源码 - 核心流程', link: '/notes/kafka/source-code/producer/producer-processing-flow' },
                      { text: 'KafkaProducer源码 - 元数据更新', link: '/notes/kafka/source-code/producer/producer-metadata' },
                    ]
                  },
                  {
                    text: 'Consumer', items: [
                    ]
                  }
                ] 
              },
            ]
        }
      ],
      '/notes/flink/': [
        { 
            text: 'Flink学习笔记', 
            link: '/notes/flink/flink-category',
            collapsed: true,
            items: [
              { text: 'Flink源码 - 从Kafka Connector看Source接口重构', link: '/notes/flink/flink-connector-kafka' }
            ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gyang94' }
    ],

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium',
        hourCycle: 'h24',
      }
    }
  }
})
