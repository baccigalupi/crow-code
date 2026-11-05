import { describe, expect, it } from 'bun:test'
import { AdditionalReadStep } from '../../../../../src/tui/install/steps/text/additional-read-step.ts'

describe('AdditionalReadStep', () => {
  it('when asked for its name, is additionalRead', () => {
    const step = new AdditionalReadStep()

    const name = step.name

    expect(name).toBe('additionalRead')
  })

  it('when asked for its label, asks for the additional read directories', () => {
    const step = new AdditionalReadStep()

    const label = step.label

    expect(label).toBe('Additional read directories')
  })

  it('when finished, goes to the additional write directories', () => {
    const step = new AdditionalReadStep()

    const next = step.next

    expect(next).toBe('additionalWrite')
  })
})
