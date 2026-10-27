import { describe, expect, it } from 'bun:test'
import { StepStore } from '../../../../src/tui/install/data-stores/step-store.ts'

describe('StepStore', () => {
  it('when built, starts on the repo step', () => {
    const step = new StepStore()

    const current = step.current.peek()

    expect(current).toBe('repo')
  })

  it('when sent to a step, shows that step', () => {
    const step = new StepStore()

    step.goTo('ignore')

    expect(step.current.peek()).toBe('ignore')
  })
})
