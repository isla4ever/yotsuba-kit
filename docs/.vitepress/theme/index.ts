import DefaultTheme from 'vitepress/theme'
import KitHome from './components/KitHome.vue'
import TransitionShowcase from './components/TransitionShowcase.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('TransitionShowcase', TransitionShowcase)
    app.component('KitHome', KitHome)
  },
}
