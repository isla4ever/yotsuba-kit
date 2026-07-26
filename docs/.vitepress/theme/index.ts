import DefaultTheme from 'vitepress/theme'
import TransitionShowcase from './components/TransitionShowcase.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component('TransitionShowcase', TransitionShowcase)
  },
}
