import { describe, expect, it } from 'bun:test'
import { DirectoriesStore } from '../../../../src/tui/install/data-stores/directories-store.ts'

describe('DirectoriesStore', () => {
  it('when built, defaults the repo directory to .crow', () => {
    const directories = new DirectoriesStore()

    const defaultDirectory = directories.defaultRepoDirectory

    expect(defaultDirectory).toBe('.crow')
  })

  it('when built, defaults the global directory to ~/.crow', () => {
    const directories = new DirectoriesStore()

    const defaultDirectory = directories.defaultGlobalDirectory

    expect(defaultDirectory).toBe('~/.crow')
  })
})
