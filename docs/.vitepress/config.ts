import { defineConfig } from 'vitepress'

const zhSidebar = {
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
}

const enSidebar = {
  '/en/': [
    {
      text: 'Guide',
      items: [
        { text: 'Getting Started', link: '/en/guide/getting-started' },
      ],
    },
    {
      text: 'Components',
      items: [
        { text: 'Schedule', link: '/en/components/schedule' },
      ],
    },
    {
      text: 'Motion',
      items: [
        { text: 'Week Transitions', link: '/en/motion/transitions' },
      ],
    },
  ],
}

export default defineConfig({
  title: 'Yotsuba Schedule Kit',
  base: '/yotsuba-kit/',
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '高度可配置的开源课表组件库：中国高校学期语义、可插拔换周动画、主题令牌与今日指挥台。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started' },
          { text: '组件', link: '/components/schedule' },
          { text: '动效', link: '/motion/transitions' },
        ],
        sidebar: zhSidebar,
        outline: { label: '本页目录' },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Highly configurable open-source class-schedule components: Chinese academic-term semantics, pluggable week transitions, theme tokens and a today dashboard.',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Components', link: '/en/components/schedule' },
          { text: 'Motion', link: '/en/motion/transitions' },
        ],
        sidebar: enSidebar,
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/isla4ever/yotsuba-kit' },
    ],
  },
})
