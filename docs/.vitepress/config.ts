import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Yotsuba Schedule Kit',
  description: '高度可配置的开源课表组件库：中国高校学期语义、可插拔换周动画、主题令牌与今日指挥台。',
  base: '/yotsuba-kit/',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/components/schedule' },
      { text: '动效', link: '/motion/transitions' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '框架接入', link: '/guide/frameworks' },
            { text: '主题定制', link: '/guide/theming' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'Schedule 课表', link: '/components/schedule' },
            { text: 'Today 今日指挥台', link: '/components/today' },
            { text: 'Guide 引导', link: '/components/guide' },
          ],
        },
        {
          text: 'API 参考',
          items: [
            { text: 'Props', link: '/components/schedule#props' },
            { text: 'Events', link: '/components/schedule#events' },
            { text: 'Methods', link: '/components/schedule#methods' },
            { text: 'Slots', link: '/components/schedule#slots' },
          ],
        },
      ],
      '/motion/': [
        {
          text: '动效',
          items: [
            { text: '换周过渡', link: '/motion/transitions' },
            { text: '自定义 TransitionSpec', link: '/motion/custom' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/isla4ever/yotsuba-kit' },
    ],
  },
})
