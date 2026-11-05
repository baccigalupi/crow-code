import { describe, expect, it } from 'bun:test'
import { EnvFileStep } from '../../../../../src/tui/install/steps/text/env-file-step.ts'

describe('EnvFileStep', () => {
  it('when asked for its name, is envFile', () => {
    const step = new EnvFileStep()

    const name = step.name

    expect(name).toBe('envFile')
  })

  it('when asked for its label, asks for the credentials file', () => {
    const step = new EnvFileStep()

    const label = step.label

    expect(label).toBe('Credentials .env file')
  })

  it('when finished, goes to the ignored paths', () => {
    const step = new EnvFileStep()

    const next = step.next

    expect(next).toBe('ignore')
  })
})
