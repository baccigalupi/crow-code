import { describe, expect, it } from 'bun:test'
import { ListFieldViewModel } from '../../../../../src/tui/install/app/config-preview/list-field-view-model.ts'

describe('ListFieldViewModel', () => {
  describe('when asked for its items', () => {
    it('quotes each one', () => {
      const field = new ListFieldViewModel({
        name: 'escalateWrite',
        value: ['./dev', './agent'],
        highlighted: false,
        json: '{}',
        last: false,
      })

      const items = field.items()

      expect(items[0].quoted()).toBe('"./dev"')
      expect(items[1].quoted()).toBe('"./agent"')
    })

    it('ends every item but the last with a comma', () => {
      const field = new ListFieldViewModel({
        name: 'escalateWrite',
        value: ['./dev', './agent'],
        highlighted: false,
        json: '{}',
        last: false,
      })

      const items = field.items()

      expect(items[0].comma()).toBe(',')
      expect(items[1].comma()).toBe('')
    })

    it('highlights them along with the list', () => {
      const field = new ListFieldViewModel({
        name: 'escalateWrite',
        value: ['./dev'],
        highlighted: true,
        json: '{}',
        last: false,
      })

      const items = field.items()

      expect(items[0].background()).toBe('#e6ca6c')
    })
  })
})
