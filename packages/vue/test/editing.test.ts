import type { Course } from '@iyotsuba/schedule-core'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import YsSchedule from '../src/YsSchedule.vue'
import YsToday from '../src/YsToday.vue'

const termStart = new Date(2026, 6, 20)
const courses: Course[] = [
  { id: 'math', name: '高等数学', teacher: '陈老师', location: '教1-201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20, materials: ['教材', '计算器'], note: '课前完成习题' },
]

describe('editing flow', () => {
  it('drag-selects empty cells and opens the builtin form, emitting course-add', async () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, termStart, reduceMotion: true, editable: true },
      attachTo: document.body,
    })
    // 编辑模式渲染空白格
    const cell = wrapper.find('[data-ys-cell][data-weekday="3"][data-section="5"]')
    expect(cell.exists()).toBe(true)
    await cell.trigger('pointerdown')
    await cell.trigger('pointerup')
    await nextTick()
    expect(wrapper.emitted('cellSelect')?.[0]).toEqual([3, 5, 5])
    // 内置表单打开并预填
    expect(document.body.textContent).toContain('新增课程')
    const nameInput = document.querySelector('.ys-form input') as HTMLInputElement
    nameInput.value = '新课程'
    nameInput.dispatchEvent(new Event('input'))
    await nextTick()
    const submit = Array.from(document.querySelectorAll('.ys-form__btn--primary')).at(-1) as HTMLButtonElement
    submit.click()
    await nextTick()
    const added = wrapper.emitted('courseAdd')?.[0]?.[0] as Course
    expect(added.name).toBe('新课程')
    expect(added.weekday).toBe(3)
    expect(added.startSection).toBe(5)
    wrapper.unmount()
  })

  it('edits and removes through the builtin detail with two-step confirm', async () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, termStart, reduceMotion: true, editable: true },
      attachTo: document.body,
    })
    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('教材与携带')
    expect(document.body.textContent).toContain('教材')
    const removeBtn = () =>
      Array.from(document.querySelectorAll('.ys-detail__btn')).find(b => b.textContent?.includes('删除')) as HTMLButtonElement
    removeBtn().click()
    await nextTick()
    expect(removeBtn().textContent).toContain('确认删除')
    expect(wrapper.emitted('courseRemove')).toBeFalsy()
    removeBtn().click()
    await nextTick()
    expect(wrapper.emitted('courseRemove')).toBeTruthy()
    wrapper.unmount()
  })

  it('exposes configurable detail share actions without owning the side effect', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart,
        reduceMotion: true,
        detail: { actions: ['share'] },
      },
      attachTo: document.body,
    })
    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    const share = document.querySelector('.ys-detail__btn--primary') as HTMLButtonElement
    expect(share.textContent).toContain('分享课程')
    share.click()
    await nextTick()
    expect(wrapper.emitted('courseShare')?.[0]?.[0]).toMatchObject({ id: 'math' })
    wrapper.unmount()
  })

  it('switches detail density locally and keeps the weather-linked surface', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart,
        reduceMotion: true,
        weather: {
          current: { kind: 'storm', temperatureC: 27 },
          daily: [{ date: '2026-07-20', kind: 'storm', lowC: 23, highC: 31 }],
          updatedAt: Date.now(),
        },
        detail: { hero: 'weather', layout: 'compact', adjustable: true },
      },
      attachTo: document.body,
    })
    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    const detail = () => document.querySelector('.ys-detail') as HTMLElement
    expect(detail().classList).toContain('is-layout-compact')
    expect(detail().classList).toContain('is-weather-linked')
    expect(detail().textContent).not.toContain('周次')
    expect(detail().textContent).toContain('雷雨 23~31°')

    const layoutSwitch = document.querySelector('.ys-detail__layout-switch') as HTMLButtonElement
    layoutSwitch.click()
    await nextTick()
    expect(detail().classList).toContain('is-layout-standard')
    expect(detail().textContent).toContain('周次')

    layoutSwitch.click()
    await nextTick()
    expect(detail().classList).toContain('is-layout-full')
    expect(detail().textContent).toContain('课前完成习题')
    expect(detail().textContent).toContain('教材')
    wrapper.unmount()
  })
})

describe('day planner', () => {
  it('shows pending badges and emits plan events from the builtin sheet', async () => {
    const monday = '2026-07-20'
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart,
        reduceMotion: true,
        dayPlans: { [monday]: [{ id: 'p1', text: '交作业', done: false }] },
      },
      attachTo: document.body,
    })
    expect(wrapper.find('.ys-schedule__day-count').text()).toBe('1')
    await wrapper.find('.ys-schedule__day').trigger('click')
    await nextTick()
    expect(document.body.textContent).toContain('日计划')
    expect(document.body.textContent).toContain('交作业')
    const check = document.querySelector('.ys-planner__check') as HTMLButtonElement
    check.click()
    expect(wrapper.emitted('planToggle')?.[0]).toEqual([monday, 'p1'])
    wrapper.unmount()
  })
})

describe('today readiness & plans widgets', () => {
  it('aggregates materials and today plans', () => {
    const monday0730 = new Date(2026, 6, 20, 7, 30)
    const wrapper = mount(YsToday, {
      props: {
        courses,
        termStart,
        now: monday0730,
        dayPlans: { '2026-07-20': [{ id: 'p1', text: '预习', done: false }] },
      },
    })
    expect(wrapper.text()).toContain('记得带')
    expect(wrapper.text()).toContain('教材、计算器')
    expect(wrapper.text()).toContain('今日计划 · 剩 1 项')
    expect(wrapper.text()).toContain('预习')
  })
})
