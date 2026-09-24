import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { CommandMatch } from '../../../src/cli/commands/command-match.ts'

describe('CommandMatch', () => {
  it('when constructed, exposes the parsed commands to subclasses', () => {
    class FirstCommandMatch extends CommandMatch {
      isMatch() {
        return this.commands[0] === 'first'
      }

      extractOptions() {
        return {}
      }
    }

    const match = new FirstCommandMatch({ commands: ['first'], options: {} })

    expect(match.isMatch()).toBe(true)
  })

  it('when constructed, exposes the parsed options to subclasses', () => {
    class GoalMatch extends CommandMatch {
      isMatch() {
        return true
      }

      extractOptions() {
        return { goal: this.options.goal }
      }
    }

    const match = new GoalMatch({ commands: [], options: { goal: 'ship' } })

    expect(match.extractOptions()).toEqual({ goal: 'ship' })
  })
})
