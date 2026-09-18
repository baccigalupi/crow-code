import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { Environment, loadEnvironmentalVariables } from '../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'

const fixtureDirectory = join(fixturesDirectory, 'env')

describe('env-vars', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  describe('Environment', () => {
    it('when values are injected, returns a value by name', () => {
      const environment = new Environment({ AA_API_KEY: 'injected-key' })

      const value = environment.value('AA_API_KEY')

      expect(value).toBe('injected-key')
    })

    it('when values are injected, hasValue is true', () => {
      const environment = new Environment({ AA_API_KEY: 'injected-key' })

      const found = environment.hasValue('AA_API_KEY')

      expect(found).toBe(true)
    })

    it('when a name is unknown, returns an empty value', () => {
      const environment = new Environment({})

      const value = environment.value('MISSING_KEY')

      expect(value).toBe('')
    })

    it('when a name is unknown, hasValue is false', () => {
      const environment = new Environment({})

      const found = environment.hasValue('MISSING_KEY')

      expect(found).toBe(false)
    })
  })

  describe('loadEnvironmentalVariables', () => {
    it('when the file has values, returns them by name', async () => {
      const valuesPath = join(fixtureDirectory, 'values.env')
      await Deno.mkdir(fixtureDirectory, { recursive: true })
      await Deno.writeTextFile(
        valuesPath,
        'AA_API_KEY=file-key\nNOUS_API_KEY=fixture-nous-key\n',
      )

      const environment = loadEnvironmentalVariables(valuesPath)

      expect(environment.value('AA_API_KEY')).toBe('file-key')
      expect(environment.value('NOUS_API_KEY')).toBe('fixture-nous-key')
    })

    it('when the file does not exist, has no values', () => {
      const missingPath = join(fixtureDirectory, 'missing.env')

      const environment = loadEnvironmentalVariables(missingPath)

      expect(environment.hasValue('AA_API_KEY')).toBe(false)
    })

    it('when a name is in both the file and the process, prefers the process', async () => {
      const valuesPath = join(fixtureDirectory, 'values.env')
      await Deno.mkdir(fixtureDirectory, { recursive: true })
      await Deno.writeTextFile(valuesPath, 'PATH=/from/file\n')

      const environment = loadEnvironmentalVariables(valuesPath)

      expect(environment.value('PATH')).toBe(Deno.env.get('PATH'))
    })

    it('when no path is given, reads the process environment', () => {
      const environment = loadEnvironmentalVariables()

      expect(environment.value('PATH')).toBe(Deno.env.get('PATH'))
    })
  })
})
