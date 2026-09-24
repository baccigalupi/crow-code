import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { Setup } from '../../../src/cli/commands/setup.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import pino from 'pino'

const fixtureDirectory = join(fixturesDirectory, 'setup')

describe('Setup', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when the command is setup, matches', () => {
    const command = new Setup({
      parsedArguments: { commands: ['setup'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const command = new Setup({
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(false)
  })

  it('when options are passed, extracts none of them', () => {
    const command = new Setup({
      parsedArguments: {
        commands: ['setup'],
        options: { verbose: true },
      },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({})
  })

  it('when run, creates the database in the injected crow directory', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')

    await new Setup({
      parsedArguments: { commands: ['setup'], options: {} },
      crowDirectory,
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(Deno.statSync(join(crowDirectory, 'crow.db')).isFile).toBe(true)
  })
})
