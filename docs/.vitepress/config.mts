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

  themeConfig: {
    logo: '/data-lake.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '学习笔记', 
        items: [
          { text: 'Kafka', link: '/notes/kafka/01-intro' },
          { text: 'Flink', link: '/notes/flink/01-intro' },
        ]
      },
      // { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: {
      '/notes/kafka/': [
        { 
            text: 'Kafka学习笔记', 
            items: [
            { text: '01-kafka简介', link: '/notes/kafka/01-intro' },
            // { text: '02-Install', link: '/notes/kafka/02-install' },
            // { text: '03-Producer', link: '/notes/kafka/03-producer' },
            // { text: '04-Consumer', link: '/notes/kafka/04-consumer' },
            // { text: '05-Advanced', link: '/notes/kafka/05-advanced' },
            ]
        }
      ],
      '/notes/flink/': [
        { 
            text: 'Flink学习笔记', 
            items: [
              { text: '01-Flink简介', link: '/notes/flink/01-intro' },
              // { text: '02-Install', link: '/notes/flink/02-install' }
            ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gyang94' }
    ]
  }
})
