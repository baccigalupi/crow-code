import { describe, expect, it } from 'bun:test'
import { EscalateWriteStep } from '../../../../src/tui/install/steps/text/escalate-write-step.ts'
import { IgnoreStep } from '../../../../src/tui/install/steps/text/ignore-step.ts'

describe('PathsTextStep', () => {
  it('when it has no default paths, its placeholder is empty brackets', () => {
    const step = new IgnoreStep()

    const placeholder = step.placeholder()

    expect(placeholder).toBe('[]')
  })

  it('when it has default paths, its placeholder joins them in parentheses', () => {
    const step = new EscalateWriteStep()

    const placeholder = step.placeholder()

    expect(placeholder).toBe('(./dev, ./agent)')
  })
})
