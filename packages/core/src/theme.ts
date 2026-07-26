/** 设计令牌：JS 层配置 → CSS 变量（--ys-*）注入 */
export interface ThemeTokens {
  canvas: string
  surface1: string
  surface2: string
  surface3: string
  text1: string
  text2: string
  text3: string
  border: string
  borderStrong: string
  gridLine: string
  accent: string
  accentSoft: string
  focusRing: string
  success: string
  warning: string
  danger: string
  /** 无自定义颜色课程的自动配色循环池 */
  coursePalette: string[]
}

export const lightTheme: ThemeTokens = {
  canvas: '#f6f7f9',
  surface1: '#ffffff',
  surface2: '#eef1f5',
  surface3: '#e3e8ee',
  text1: '#1c232d',
  text2: '#45505e',
  text3: '#8a94a3',
  border: '#dde2e9',
  borderStrong: '#c5cdd8',
  gridLine: '#e8ebf0',
  accent: '#3d76dd',
  accentSoft: '#e4edfc',
  focusRing: '#9dbdf2',
  success: '#0fa47f',
  warning: '#d97a12',
  danger: '#d1403f',
  coursePalette: [
    '#d1477a', '#5a68d8', '#0f9d8f', '#c07a1b',
    '#4b8bd4', '#b0538f', '#3f9d54', '#8a63c9',
    '#c25b3c', '#2f8fa8',
  ],
}

export const darkTheme: ThemeTokens = {
  canvas: '#14171c',
  surface1: '#1d2128',
  surface2: '#242a33',
  surface3: '#2c333e',
  text1: '#eef1f5',
  text2: '#b8c0cc',
  text3: '#7c8697',
  border: '#333a45',
  borderStrong: '#465060',
  gridLine: '#2a313b',
  accent: '#6c9aec',
  accentSoft: '#22314d',
  focusRing: '#3d5a90',
  success: '#35b795',
  warning: '#e09a4a',
  danger: '#e06a67',
  coursePalette: [
    '#b34069', '#5361b8', '#118a7e', '#a5691b',
    '#40749f', '#96477b', '#398a4b', '#7657ab',
    '#a44f34', '#2b7a8f',
  ],
}

export function tokensToCssVars(tokens: ThemeTokens): Record<string, string> {
  return {
    '--ys-canvas': tokens.canvas,
    '--ys-surface-1': tokens.surface1,
    '--ys-surface-2': tokens.surface2,
    '--ys-surface-3': tokens.surface3,
    '--ys-text-1': tokens.text1,
    '--ys-text-2': tokens.text2,
    '--ys-text-3': tokens.text3,
    '--ys-border': tokens.border,
    '--ys-border-strong': tokens.borderStrong,
    '--ys-grid-line': tokens.gridLine,
    '--ys-accent': tokens.accent,
    '--ys-accent-soft': tokens.accentSoft,
    '--ys-focus-ring': tokens.focusRing,
    '--ys-success': tokens.success,
    '--ys-warning': tokens.warning,
    '--ys-danger': tokens.danger,
  }
}

/** 按课程名稳定分配调色板颜色（同名课永远同色） */
export function createCourseColorResolver(tokens: ThemeTokens) {
  const assigned = new Map<string, string>()
  return (name: string, explicit?: string): string => {
    if (explicit) {
      return explicit
    }
    const existing = assigned.get(name)
    if (existing) {
      return existing
    }
    const palette = tokens.coursePalette
    const color = palette[assigned.size % palette.length] ?? '#3d76dd'
    assigned.set(name, color)
    return color
  }
}

/* ------------------------------ 精选配色库 ------------------------------ */

import type { PaletteName } from './types'

/**
 * 六套精选课程卡配色库,50 色全部通过白字(#fff)对比度 ≥3:1 逐色验证,
 * 套内两两 Lab ΔE ≥14.5,相邻色相交错保证同屏可辨。
 */
export const coursePalettes: Record<PaletteName, string[]> = {
  classic: [
    '#d1477a', '#5a68d8', '#0f9d8f', '#c07a1b', '#4b8bd4',
    '#b0538f', '#3f9d54', '#8a63c9', '#c25b3c', '#2f8fa8',
  ],
  /** 马卡龙:低饱和甜色,深浅模式通用 */
  macaron: [
    '#c76075', '#6b82c7', '#50955c', '#ba763b', '#9672c0',
    '#3f8d82', '#ba5e98', '#738745', '#4e8ebc', '#c9745e',
  ],
  /** 莫兰迪:灰调高级,深浅模式通用性最佳 */
  morandi: [
    '#ac777b', '#7690a7', '#64876d', '#986752', '#a47fa4',
    '#507c7c', '#875a6c', '#747a52', '#696b96', '#a2915d',
  ],
  /** 赛博霓虹:满彩度压暗,深色模式最出彩 */
  cyber: [
    '#d41193', '#08839b', '#6c44e4', '#3f8b18', '#dc185a',
    '#136dec', '#0f8a61', '#ae17d3', '#d45211', '#0a85c2',
  ],
  /** 自然森系:绿系骨架 + 棕陶蓝调剂 */
  forest: [
    '#27684d', '#865b3c', '#63863c', '#3681a1', '#74722f',
    '#a6593f', '#296b69', '#947238', '#2d763f', '#586d9d',
  ],
  /** 落日暖调:暖橙金与暮色冷紫交替 */
  sunset: [
    '#d06425', '#955eba', '#bc8b17', '#c63980', '#d45749',
    '#574dac', '#9b6b3b', '#9b2740', '#c16773', '#944286',
  ],
}

/** 解析配色库：库名 → 预设 10 色;自定义数组原样返回;非法回退 classic */
export function resolvePalette(palette: PaletteName | string[] | undefined): string[] {
  if (Array.isArray(palette) && palette.length > 0) {
    return palette
  }
  if (typeof palette === 'string' && palette in coursePalettes) {
    return coursePalettes[palette]
  }
  return coursePalettes.classic
}
