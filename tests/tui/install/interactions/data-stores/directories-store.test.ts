import { describe, expect, it } from 'bun:test'
import { DirectoriesStore } from '../../../../../src/tui/install/interactions/data-stores/directories-store.ts'

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

  it('when no repo directory is typed, puts the config path in .crow', () => {
    const directories = new DirectoriesStore()

    const path = directories.configPath.value

    expect(path).toBe('.crow/config.json')
  })

  it('when a repo directory is typed, puts the config path in it', () => {
    const directories = new DirectoriesStore()
    directories.repoDirectory.replace('custom')

    const path = directories.configPath.value

    expect(path).toBe('custom/config.json')
  })

  it('when no global directory is typed, the global path is ~/.crow', () => {
    const directories = new DirectoriesStore()

    const path = directories.globalPath.value

    expect(path).toBe('~/.crow')
  })

  it('when a global directory is typed, the global path is that directory', () => {
    const directories = new DirectoriesStore()
    directories.globalDirectory.replace('/g')

    const path = directories.globalPath.value

    expect(path).toBe('/g')
  })

  it('when asked for the default env file, puts .env in the global path', () => {
    const directories = new DirectoriesStore()
    directories.globalDirectory.replace('/g')

    const path = directories.defaultEnvFile.value

    expect(path).toBe('/g/.env')
  })
})
