import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import KitHome from './components/KitHome.vue'
import SidebarAnchorSync from './components/SidebarAnchorSync.vue'
import TransitionShowcase from './components/TransitionShowcase.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-bottom': () => h(SidebarAnchorSync),
  }),
  enhanceApp({ app }: { app: any }) {
    app.component('TransitionShowcase', TransitionShowcase)
    app.component('KitHome', KitHome)
  },
}
