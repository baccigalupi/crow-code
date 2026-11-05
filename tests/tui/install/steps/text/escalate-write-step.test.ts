import { describe, expect, it } from 'bun:test'
import { EscalateWriteStep } from '../../../../../src/tui/install/steps/text/escalate-write-step.ts'

describe('EscalateWriteStep', () => {
  it('when asked for its name, is escalateWrite', () => {
    const step = new EscalateWriteStep()

    const name = step.name

    expect(name).toBe('escalateWrite')
  })

  it('when asked for its label, asks for the escalate write directories', () => {
    const step = new EscalateWriteStep()

    const label = step.label

    expect(label).toBe('Escalate write directories')
  })

  it('when finished, goes to the allowed local scripts', () => {
    const step = new EscalateWriteStep()

    const next = step.next

    expect(next).toBe('allowedLocalScripts')
  })

  it('when asked for its default paths, is the dev and agent directories', () => {
    const step = new EscalateWriteStep()

    const defaultPaths = step.defaultPaths

    expect(defaultPaths).toEqual(['./dev', './agent'])
  })
})
