import { describe, expect, it } from 'bun:test'
import { IgnoreStep } from '../../../../src/tui/install/steps/text/ignore-step.ts'

describe('JsonListTextStep', () => {
  it('when asked for its default, is its config list as JSON', () => {
    const step = new IgnoreStep()

    const defaultValue = step.defaultValue()

    expect(defaultValue).toBe('[]')
  })

  it('when asked for its placeholder, is the JSON list alone', () => {
    const step = new IgnoreStep()

    const placeholder = step.placeholder()

    expect(placeholder).toBe('[]')
  })
})
