import { describe, expect, it } from 'bun:test'
import { AdditionalWriteStep } from '../../../../../src/tui/install/steps/text/additional-write-step.ts'

describe('AdditionalWriteStep', () => {
  it('when asked for its name, is additionalWrite', () => {
    const step = new AdditionalWriteStep()

    const name = step.name

    expect(name).toBe('additionalWrite')
  })

  it('when asked for its label, asks for the additional write directories', () => {
    const step = new AdditionalWriteStep()

    const label = step.label

    expect(label).toBe('Additional write directories')
  })

  it('when finished, goes to the escalate read directories', () => {
    const step = new AdditionalWriteStep()

    const next = step.next

    expect(next).toBe('escalateRead')
  })
})
