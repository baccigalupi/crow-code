import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Help, HelpMatch } from '../../../src/cli/commands/help.ts'
import { Environment } from '../../../src/env-vars.ts'

describe('help', () => {
  it('when run, writes the usage text', () => {
    const consoleLog = mock.fn()
    const help = new Help(
      {
        crowDirectory: '',
        logger: pino({ enabled: false }),
        consoleLog,
        fetchClient: fetch,
        denoCommand: Deno.Command,
        environment: new Environment({}),
      },
      {},
    )

    help.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  describe('HelpMatch', () => {
    it('when --help is passed, returns true', () => {
      const match = new HelpMatch({ commands: [], options: { help: true } })

      expect(match.isMatch()).toBe(true)
    })

    it('when -h is passed, returns true', () => {
      const match = new HelpMatch({ commands: [], options: { h: true } })

      expect(match.isMatch()).toBe(true)
    })

    it('when no help option is passed, returns false', () => {
      const match = new HelpMatch({ commands: [], options: {} })

      expect(match.isMatch()).toBe(false)
    })

    it('when options are passed, extracts none of them', () => {
      const match = new HelpMatch({
        commands: [],
        options: { help: true, verbose: true },
      })

      expect(match.extractOptions()).toEqual({})
    })
  })
})
