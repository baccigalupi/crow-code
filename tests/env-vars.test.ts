import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { Environment, loadEnvironmentalVariables } from '../src/env-vars.ts'

describe('env-vars', () => {
  it('when a value exists, returns it', () => {
    const environment = new Environment({ API_KEY: 'secret' })

    const value = environment.value('API_KEY')

    expect(value).toBe('secret')
    expect(environment.hasValue('API_KEY')).toBe(true)
  })

  it('when a value is missing, returns an empty value', () => {
    const environment = new Environment({})

    const value = environment.value('API_KEY')

    expect(value).toBe('')
    expect(environment.hasValue('API_KEY')).toBe(false)
  })

  it('when an environment file exists, loads its values', () => {
    const directory = Deno.makeTempDirSync()
    const path = join(directory, 'values.env')
    Deno.writeTextFileSync(path, 'FILE_ONLY_KEY=file-value\n')

    const environment = loadEnvironmentalVariables(path)

    expect(environment.value('FILE_ONLY_KEY')).toBe('file-value')
    Deno.removeSync(directory, { recursive: true })
  })

  it('when an environment file is missing, loads process values', () => {
    const path = join(Deno.makeTempDirSync(), 'missing.env')

    const environment = loadEnvironmentalVariables(path)

    expect(environment.value('PATH')).toBe(Deno.env.get('PATH'))
  })
})
