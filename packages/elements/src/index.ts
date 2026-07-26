import { defineCustomElement } from 'vue'
// 直接从 vue 包源码编译（customElement 模式将样式注入 shadow root）
import YsScheduleSfc from '../../vue/src/YsSchedule.vue'

export const YsScheduleElement = defineCustomElement(YsScheduleSfc)

export function register(tagName = 'ys-schedule'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, YsScheduleElement)
  }
}

// iife/CDN 引入时自动注册
if (typeof window !== 'undefined') {
  register()
}
