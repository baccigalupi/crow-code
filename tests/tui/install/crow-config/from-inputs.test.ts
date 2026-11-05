import { describe, expect, it } from 'bun:test'
import { crowConfigFromInputs } from '../../../../src/tui/install/crow-config/from-inputs.ts'

describe('from-inputs', () => {
  it('includes finished providers', () => {
    const inputs = {
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [{ name: 'nous', url: 'https://n' }],
    }

    const config = crowConfigFromInputs(inputs).crowConfig()

    expect(config.providers).toEqual([{ name: 'nous', baseUrl: 'https://n' }])
  })

  it('previews the draft provider', () => {
    const inputs = {
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: 'or',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
      step: 'providerUrl' as const,
    }

    const config = crowConfigFromInputs(inputs).crowConfig()

    expect(config.providers).toEqual([{ name: 'or', baseUrl: '' }])
  })

  it('opens a blank record after a finished provider on a provider step', () => {
    const inputs = {
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [{ name: 'nous', url: 'https://n' }],
      step: 'providerName' as const,
    }

    const config = crowConfigFromInputs(inputs).crowConfig()

    expect(config.providers).toEqual([
      { name: 'nous', baseUrl: 'https://n' },
      { name: '', baseUrl: '' },
    ])
  })

  it('when no directories are given, resolves the defaults', () => {
    const repoDirectory = ''
    const globalDirectory = ''

    const builder = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    })

    expect(builder.crowRepoDirectory()).toBe('.crow')
    expect(builder.crowGlobalDirectory()).toBe('~/.crow')
    expect(builder.crowConfigPath()).toBe('.crow/config.json')
  })

  it('when directories are given, resolves the given directories', () => {
    const repoDirectory = './lib'
    const globalDirectory = '/opt/crow'

    const builder = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    })

    expect(builder.crowRepoDirectory()).toBe('./lib')
    expect(builder.crowGlobalDirectory()).toBe('/opt/crow')
    expect(builder.crowConfigPath()).toBe('./lib/config.json')
  })

  it('when no env file is given and the global directory is the default, resolves ~/.crow/.env', () => {
    const repoDirectory = ''
    const globalDirectory = ''
    const envFile = ''

    const config = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.envFile).toBe('~/.crow/.env')
  })

  it('when no env file is given and the global directory is custom, resolves .env inside it', () => {
    const repoDirectory = ''
    const globalDirectory = '/opt/crow'
    const envFile = ''

    const config = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.envFile).toBe('/opt/crow/.env')
  })

  it('when an env file is given, it wins over the derived default', () => {
    const repoDirectory = ''
    const globalDirectory = '/opt/crow'
    const envFile = '/secrets/crow.env'

    const config = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.envFile).toBe('/secrets/crow.env')
  })

  it('includes the default permissions block', () => {
    const repoDirectory = ''
    const globalDirectory = ''

    const config = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.permissions.ignore).toEqual([])
    expect(config.permissions.additionalRead).toEqual([])
    expect(config.permissions.additionalWrite).toEqual([])
  })

  it('when additional read directories are given, splits them on commas', () => {
    const additionalRead = '/docs, ~/notes'

    const config = crowConfigFromInputs({
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      ignore: '',
      additionalRead,
      additionalWrite: '',
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.permissions.additionalRead).toEqual(['/docs', '~/notes'])
  })

  it('when ignore paths are given, includes them in the config and the json', () => {
    const ignore = '.env'

    const builder = crowConfigFromInputs({
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      ignore,
      additionalRead: '',
      additionalWrite: '',
      escalateRead: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    })

    expect(builder.crowConfig().permissions.ignore).toEqual(['.env'])
    expect(builder.crowConfigJson()).toContain('".env"')
  })

  it('when no escalate directories are given, resolves the defaults', () => {
    const escalateRead = ''
    const escalateWrite = ''

    const config = crowConfigFromInputs({
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.permissions.escalateRead).toEqual([])
    expect(config.permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('when escalate directories are given, splits them on commas', () => {
    const escalateRead = '/docs, ~/notes'
    const escalateWrite = './scripts'

    const config = crowConfigFromInputs({
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateRead,
      escalateWrite,
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.permissions.escalateRead).toEqual(['/docs', '~/notes'])
    expect(config.permissions.escalateWrite).toEqual(['./scripts'])
  })

  it('when escalate input has only separators, resolves the defaults', () => {
    const escalateWrite = ' , ,'

    const config = crowConfigFromInputs({
      repoDirectory: '',
      globalDirectory: '',
      envFile: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateRead: '',
      escalateWrite,
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    }).crowConfig()

    expect(config.permissions.escalateWrite).toEqual(['./dev', './agent'])
  })

  it('serializes the config to pretty json', () => {
    const repoDirectory = ''
    const globalDirectory = ''

    const builder = crowConfigFromInputs({
      repoDirectory,
      globalDirectory,
      envFile: '',
      escalateRead: '',
      ignore: '',
      additionalRead: '',
      additionalWrite: '',
      escalateWrite: '',
      allowedLocalScripts: '',
      providerName: '',
      providerUrl: '',
      providerCredentials: '',
      providers: [],
    })

    expect(JSON.parse(builder.crowConfigJson())).toEqual(builder.crowConfig())
    expect(builder.crowConfigJson()).toContain('\n')
    expect(builder.crowConfigJson()).toContain('"envFile": "~/.crow/.env"')
  })
})
