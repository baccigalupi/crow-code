import { describe, expect, it } from 'bun:test'
import { RepoDirectoryStep } from '../../../../../src/tui/install/steps/text/repo-directory-step.ts'

describe('RepoDirectoryStep', () => {
  it('when asked for its name, is repoDirectory', () => {
    const step = new RepoDirectoryStep()

    const name = step.name

    expect(name).toBe('repoDirectory')
  })

  it('when asked for its label, asks for the local repo directory', () => {
    const step = new RepoDirectoryStep()

    const label = step.label

    expect(label).toBe('What directory for the local repo crow setup')
  })

  it('when finished, goes to the global directory', () => {
    const step = new RepoDirectoryStep()

    const next = step.next

    expect(next).toBe('crowGlobalDirectory')
  })

  it('when asked for its default path, is .crow', () => {
    const step = new RepoDirectoryStep()

    const defaultPath = step.defaultPath

    expect(defaultPath).toBe('.crow')
  })
})
