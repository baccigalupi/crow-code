import { describe, expect, it } from 'bun:test'
import { AllowedLocalScriptsStep } from '../../../../../src/tui/install/steps/text/allowed-local-scripts-step.ts'

describe('AllowedLocalScriptsStep', () => {
  it('when asked for its name, is allowedLocalScripts', () => {
    const step = new AllowedLocalScriptsStep()

    const name = step.name

    expect(name).toBe('allowedLocalScripts')
  })

  it('when asked for its label, asks for the allowed local scripts', () => {
    const step = new AllowedLocalScriptsStep()

    const label = step.label

    expect(label).toBe('Allowed local scripts')
  })

  it('when finished, goes to the provider name', () => {
    const step = new AllowedLocalScriptsStep()

    const next = step.next

    expect(next).toBe('providerName')
  })

  it('when asked for its default paths, is the dev and agent scripts', () => {
    const step = new AllowedLocalScriptsStep()

    const defaultPaths = step.defaultPaths

    expect(defaultPaths).toEqual(['./dev/*', './agent/*'])
  })
})
