import { describe, expect, it } from 'bun:test'
import { CrowGlobalDirectoryStep } from '../../../../../src/tui/install/steps/text/crow-global-directory-step.ts'

describe('CrowGlobalDirectoryStep', () => {
  it('when asked for its name, is crowGlobalDirectory', () => {
    const step = new CrowGlobalDirectoryStep()

    const name = step.name

    expect(name).toBe('crowGlobalDirectory')
  })

  it('when asked for its label, asks for the user crow directory', () => {
    const step = new CrowGlobalDirectoryStep()

    const label = step.label

    expect(label).toBe('User crow directory')
  })

  it('when finished, goes to the env file', () => {
    const step = new CrowGlobalDirectoryStep()

    const next = step.next

    expect(next).toBe('envFile')
  })
})
