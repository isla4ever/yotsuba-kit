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
        { text: '版本与发布状态', link: '/guide/release-status' },
      ],
    },
  ],
  '/components/': [
    {
      text: 'Schedule 课表',
      collapsed: false,
      items: [
        { text: '概览与用法', link: '/components/schedule' },
        { text: 'Props 配置项', link: '/components/schedule#props' },
        { text: 'Events 事件', link: '/api/events#ysschedule' },
        { text: 'Methods 方法', link: '/api/methods#ysschedule' },
        { text: 'Slots 插槽', link: '/api/slots#ysschedule' },
        { text: '编辑模式', link: '/components/schedule#编辑模式' },
        { text: '日计划', link: '/components/schedule#日计划' },
        { text: '自定义背景', link: '/components/schedule#自定义背景' },
        { text: '天气、详情与弹层', link: '/components/schedule#天气详情与弹层' },
      ],
    },
    {
      text: 'Today 今日指挥台',
      collapsed: false,
      items: [
        { text: '概览与用法', link: '/components/today' },
        { text: '内置 widget', link: '/components/today#内置-widget' },
        { text: '自定义 widget', link: '/components/today#自定义-widget' },
        { text: '配置与布局', link: '/components/today#配置与布局' },
      ],
    },
    {
      text: '课程数据',
      collapsed: false,
      items: [
        { text: 'Course、教材、携带物与任务', link: '/components/course-data' },
      ],
    },
    {
      text: 'Guide 引导',
      collapsed: false,
      items: [
        { text: '三模式概览', link: '/components/guide' },
        { text: '用法', link: '/components/guide#用法' },
        { text: '自定义剧本', link: '/components/guide#自定义剧本' },
        { text: 'Events / Methods', link: '/components/guide#events-methods' },
      ],
    },
  ],
  '/api/': [
    {
      text: 'Core API',
      collapsed: false,
      items: [
        { text: '学期、冲突与交换', link: '/api/core' },
        { text: '天气、主题与动效', link: '/api/core#天气主题与动效' },
      ],
    },
    {
      text: '组件契约',
      collapsed: false,
      items: [
        { text: '事件', link: '/api/events' },
        { text: '方法', link: '/api/methods' },
        { text: '插槽', link: '/api/slots' },
      ],
    },
  ],
  '/frameworks/': [
    {
      text: 'Web',
      items: [
        { text: 'Vue 3', link: '/frameworks/vue' },
        { text: 'React 与 Elements', link: '/frameworks/react-elements' },
      ],
    },
    {
      text: 'Flutter',
      items: [
        { text: 'yotsuba_schedule_kit', link: '/frameworks/flutter' },
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
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.id?.includes('framer-motion')) {
            return
          }
          warn(warning)
        },
      },
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/yotsuba-kit/favicon.svg' }],
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: '高度可配置的开源课表组件库：中国高校学期语义、可插拔换周动画、主题令牌与今日指挥台。',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started' },
          { text: '组件', link: '/components/schedule' },
          { text: 'API', link: '/api/core' },
          { text: 'Frameworks', link: '/frameworks/vue' },
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
