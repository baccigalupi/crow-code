import { describe, expect, it } from 'bun:test'
import { EscalateReadStep } from '../../../../../src/tui/install/steps/text/escalate-read-step.ts'

describe('EscalateReadStep', () => {
  it('when asked for its name, is escalateRead', () => {
    const step = new EscalateReadStep()

    const name = step.name

    expect(name).toBe('escalateRead')
  })

  it('when asked for its label, asks for the escalate read directories', () => {
    const step = new EscalateReadStep()

    const label = step.label

    expect(label).toBe('Escalate read directories')
  })

  it('when finished, goes to the escalate write directories', () => {
    const step = new EscalateReadStep()

    const next = step.next

    expect(next).toBe('escalateWrite')
  })
})
