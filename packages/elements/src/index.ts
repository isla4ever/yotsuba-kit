import { defineCustomElement } from 'vue'
// 直接从 vue 包源码编译（customElement 模式将样式注入 shadow root）
import YsScheduleSfc from '../../vue/src/YsSchedule.vue'
import YsTodaySfc from '../../vue/src/YsToday.vue'

export const YsScheduleElement = defineCustomElement(YsScheduleSfc)
export const YsTodayElement = defineCustomElement(YsTodaySfc)

export function register(prefix = 'ys'): void {
  if (typeof customElements === 'undefined') {
    return
  }
  if (!customElements.get(`${prefix}-schedule`)) {
    customElements.define(`${prefix}-schedule`, YsScheduleElement)
  }
  if (!customElements.get(`${prefix}-today`)) {
    customElements.define(`${prefix}-today`, YsTodayElement)
  }
}

// import / CDN 引入时自动注册
if (typeof window !== 'undefined') {
  register()
}
