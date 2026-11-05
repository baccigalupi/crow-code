import { describe, expect, it } from 'bun:test'
import { IgnoreStep } from '../../../../../src/tui/install/steps/text/ignore-step.ts'

describe('IgnoreStep', () => {
  it('when asked for its name, is ignore', () => {
    const step = new IgnoreStep()

    const name = step.name

    expect(name).toBe('ignore')
  })

  it('when asked for its label, asks for the ignored paths', () => {
    const step = new IgnoreStep()

    const label = step.label

    expect(label).toBe('Ignored paths')
  })

  it('when finished, goes to the additional read directories', () => {
    const step = new IgnoreStep()

    const next = step.next

    expect(next).toBe('additionalRead')
  })
})
