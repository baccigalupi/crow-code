import { describe, expect, it } from 'bun:test'
import { GitForms } from '../../../../../../src/tools/git/read-only/git-passthrough/git-subcommands/forms.ts'

describe('GitForms', () => {
  describe('refusal', () => {
    it('when there are no forms, does not refuse', () => {
      const forms = new GitForms({ name: 'log', args: ['HEAD'] })

      const refusal = forms.refusal()

      expect(refusal).toBe('')
    })

    it('when the first arg is an allowed form, does not refuse', () => {
      const forms = new GitForms({
        name: 'stash',
        forms: ['list', 'show'],
        args: ['list'],
      })

      const refusal = forms.refusal()

      expect(refusal).toBe('')
    })

    it('when the first arg is another form, names the allowed forms', () => {
      const forms = new GitForms({
        name: 'stash',
        forms: ['list', 'show'],
        args: ['pop'],
      })

      const refusal = forms.refusal()

      expect(refusal).toBe(
        'subcommand not allowed: stash pop; allowed forms for stash: list, show',
      )
    })
  })

  it('when there are no forms, flags start at 0', () => {
    const forms = new GitForms({ name: 'log', args: [] })

    const start = forms.flagStart()

    expect(start).toBe(0)
  })

  it('when there are forms, flags start after the form', () => {
    const forms = new GitForms({
      name: 'stash',
      forms: ['list'],
      args: ['list'],
    })

    const start = forms.flagStart()

    expect(start).toBe(1)
  })
})
