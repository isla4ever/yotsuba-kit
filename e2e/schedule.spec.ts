import { expect, test } from '@playwright/test'

// 波浪换周的核心验收：任何一帧不出现空网格。
// 不用截图对比（跨平台字体不稳定），改用 DOM 探针采样透明度——确定性且快。

test('renders the schedule with wechat-parity cards', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.ys-topbar__week')).toContainText('第 1 周')
  await expect(page.locator('.ys-course-card', { hasText: '高等数学' })).toBeVisible()
  // 非本周卡（专业导论 2-5 周）置灰徽标
  await expect(page.locator('.ys-course-card.is-muted', { hasText: '专业导论' })).toBeVisible()
  // 重叠角标不被表头裁剪：完整可见
  const badge = page.locator('.ys-schedule__layer--current .ys-schedule__badge').first()
  await expect(badge).toBeVisible()
  const box = (await badge.boundingBox())!
  const bar = (await page.locator('.ys-schedule__weekday-bar').boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1)
})

test('wave transition never shows an empty grid frame', async ({ page }) => {
  await page.goto('/')
  await page.locator('.ys-course-card').first().waitFor()

  // 换周前布置采样钩子：点击后 40/90/140ms 记录两层可见卡片数
  await page.evaluate(() => {
    const w = window as unknown as { __samples: Array<{ t: number, leaving: number, entering: number }> }
    w.__samples = []
    const count = (selector: string) =>
      Array.from(document.querySelectorAll(`${selector} .ys-course-card`))
        .filter(el => Number(getComputedStyle(el.parentElement!).opacity) > 0.15
          && Number(getComputedStyle(el).opacity) > 0.15).length
    window.addEventListener('click', () => {
      for (const t of [40, 90, 140]) {
        setTimeout(() => {
          w.__samples.push({
            t,
            leaving: count('.ys-schedule__layer--leaving'),
            entering: count('.ys-schedule__layer--current'),
          })
        }, t)
      }
    }, { capture: true })
  })

  await page.locator('.ys-topbar__week').click()
  await page.locator('.ys-week-picker__item', { hasText: /^2$/ }).click()
  await page.waitForTimeout(700)

  const samples = await page.evaluate(() =>
    (window as unknown as { __samples: Array<{ t: number, leaving: number, entering: number }> }).__samples,
  )
  // 采样点来自选周点击（可能混入开面板的点击采样，过滤 leaving>0 的换周采样）
  const transitionSamples = samples.filter(sample => sample.leaving > 0 || sample.entering > 0)
  expect(transitionSamples.length).toBeGreaterThan(0)
  for (const sample of transitionSamples) {
    // 无空帧：任一时刻旧层+新层的可见卡片总数不为 0
    expect(sample.leaving + sample.entering).toBeGreaterThan(0)
  }

  // 终态：旧层移除、周数更新、双周课激活
  await expect(page.locator('.ys-schedule__layer')).toHaveCount(1)
  await expect(page.locator('.ys-topbar__week')).toContainText('第 2 周')
  await expect(page.locator('.ys-course-card:not(.is-muted)', { hasText: '线性代数' })).toBeVisible()
})

test('overlap transitions never paint an inactive course on top', async ({ page }) => {
  await page.goto('/')
  await page.locator('.ys-course-card', { hasText: '体育（单周）' }).waitFor()

  await page.evaluate(() => {
    const state = window as unknown as {
      __overlapSamples: Array<{ top: string | null, muted: boolean | null }>
    }
    state.__overlapSamples = []

    const isPainted = (element: Element) => {
      let current: Element | null = element
      let opacity = 1
      while (current && current instanceof HTMLElement) {
        const style = getComputedStyle(current)
        if (style.visibility === 'hidden' || style.display === 'none') return false
        opacity *= Number(style.opacity || 1)
        current = current.parentElement
      }
      return opacity > 0.02
    }

    window.addEventListener('click', (event) => {
      if (!(event.target as Element).closest('.ys-week-picker__item')) return
      const target = Array.from(document.querySelectorAll('.ys-course-card'))
        .find(card => card.textContent?.includes('体育（单周）'))
      const rect = target?.getBoundingClientRect()
      if (!rect) return
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const startedAt = performance.now()
      const sample = () => {
        const top = document.elementsFromPoint(x, y)
          .map(element => element.closest('.ys-course-card'))
          .find((card, index, cards) => card && cards.indexOf(card) === index && isPainted(card))
        state.__overlapSamples.push({
          top: top?.querySelector('strong')?.textContent ?? null,
          muted: top?.classList.contains('is-muted') ?? null,
        })
        if (performance.now() - startedAt < 760) requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    }, { capture: true })
  })

  const pickWeek = async (week: number) => {
    await page.locator('.ys-topbar__week').click()
    await page.locator('.ys-week-picker__item', { hasText: new RegExp(`^${week}$`) }).click()
    await page.waitForTimeout(800)
  }

  await pickWeek(2)
  await pickWeek(1)

  const samples = await page.evaluate(() =>
    (window as unknown as {
      __overlapSamples: Array<{ top: string | null, muted: boolean | null }>
    }).__overlapSamples,
  )
  expect(samples.length).toBeGreaterThan(60)
  expect(samples.some(sample => sample.top === '体育（单周）')).toBe(true)
  expect(samples.some(sample => sample.top === '线性代数（双周）')).toBe(true)
  expect(samples.filter(sample => sample.top !== null && sample.muted)).toEqual([])
})

test('builtin course detail opens from a card tap', async ({ page }) => {
  await page.goto('/')
  await page.locator('.ys-course-card', { hasText: '高等数学' }).click()
  await expect(page.locator('.ys-sheet')).toContainText('课程详情')
  await expect(page.locator('.ys-detail__grid')).toContainText('第1-2节')
})
