<script setup lang="ts">
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CountUp from './CountUp.jsx'

const props = withDefaults(defineProps<{
  to: number
  from?: number
  direction?: 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  startWhen?: boolean
  separator?: string
}>(), {
  from: 0,
  direction: 'up',
  delay: 0,
  duration: 1.4,
  className: '',
  startWhen: true,
  separator: '',
})

const host = ref<HTMLElement | null>(null)
let root: Root | null = null

function render() {
  if (!root) return
  root.render(createElement(CountUp, {
    to: props.to,
    from: props.from,
    direction: props.direction,
    delay: props.delay,
    duration: props.duration,
    className: props.className,
    startWhen: props.startWhen,
    separator: props.separator,
  }))
}

onMounted(() => {
  if (!host.value) return
  root = createRoot(host.value)
  render()
})

watch(props, render, { deep: true })
onBeforeUnmount(() => root?.unmount())
</script>

<template>
  <span ref="host" class="react-count-up" aria-live="off" />
</template>
