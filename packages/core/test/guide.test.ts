import type { GuideConfig } from '../src/types'
import { describe, expect, it } from 'vitest'
import { createGuideMachine } from '../src/guide'

const steps: GuideConfig['steps'] = [
  { id: 'a', title: 'A', body: '', target: 'x' },
  { id: 'b', title: 'B', body: '', target: 'y', expect: 'tap' },
  { id: 'c', title: 'C', body: '', target: 'z', expect: 'swipe-left' },
]

describe('guide machine', () => {
  it('walks through steps and finishes', () => {
    const machine = createGuideMachine({ mode: 'spotlight', steps })
    machine.start()
    expect(machine.state().stepIndex).toBe(0)
    machine.next()
    machine.next()
    expect(machine.state().step?.id).toBe('c')
    machine.next()
    expect(machine.state().active).toBe(false)
  })

  it('walkthrough waits for the expected real action', () => {
    const machine = createGuideMachine({ mode: 'walkthrough', steps })
    machine.start()
    expect(machine.state().awaitingAction).toBe(false) // 第一步无 expect
    machine.next()
    expect(machine.state().awaitingAction).toBe(true)
    // 错误动作不前进
    expect(machine.completeAction('swipe-left')).toBe(false)
    expect(machine.state().step?.id).toBe('b')
    // 正确动作前进
    expect(machine.completeAction('tap')).toBe(true)
    expect(machine.state().step?.id).toBe('c')
    expect(machine.completeAction('swipe-left')).toBe(true)
    expect(machine.state().active).toBe(false)
  })

  it('tips/spotlight ignore expect (never awaiting)', () => {
    const machine = createGuideMachine({ mode: 'tips', steps })
    machine.start()
    machine.next()
    expect(machine.state().awaitingAction).toBe(false)
  })

  it('respects storageKey to run once', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
    }
    const machine = createGuideMachine({ mode: 'spotlight', steps, storageKey: 'done' }, { storage })
    machine.start()
    machine.skip()
    expect(memory.get('done')).toBe('1')
    machine.start()
    expect(machine.state().active).toBe(false)
  })

  it('can be replayed explicitly after the first-run marker exists', () => {
    const memory = new Map([['done', '1']])
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => void memory.set(key, value),
    }
    const machine = createGuideMachine({ mode: 'spotlight', steps, storageKey: 'done' }, { storage })

    machine.start()
    expect(machine.state().active).toBe(false)

    machine.start({ force: true })
    expect(machine.state().active).toBe(true)
    expect(machine.state().step?.id).toBe('a')
  })
})
