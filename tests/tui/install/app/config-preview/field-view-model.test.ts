import { describe, expect, it } from 'bun:test'
import { FieldViewModel } from '../../../../../src/tui/install/app/config-preview/field-view-model.ts'

describe('FieldViewModel', () => {
  describe('when the highlighted key is its name', () => {
    it('draws dark on gold', () => {
      const field = new FieldViewModel({
        name: 'envFile',
        editable: true,
        highlightKey: 'envFile',
      })

      const colors = [field.textColor(), field.background()]

      expect(colors).toEqual(['#0a0f1e', '#e6ca6c'])
    })

    it('takes the id the scroll reveals', () => {
      const field = new FieldViewModel({
        name: 'envFile',
        editable: true,
        highlightKey: 'envFile',
      })

      const id = field.id()

      expect(id).toBe('config-highlight')
    })

    it('when not editable, stays unhighlighted', () => {
      const field = new FieldViewModel({
        name: 'envFile',
        editable: false,
        highlightKey: 'envFile',
      })

      const id = field.id()

      expect(id).toBe('config-envFile')
    })
  })

  it('when another key is highlighted, keeps the default colors', () => {
    const field = new FieldViewModel({
      name: 'envFile',
      editable: true,
      highlightKey: 'ignore',
    })

    const colors = [field.textColor(), field.background()]

    expect(colors).toEqual([undefined, undefined])
  })

  it('when another key is highlighted, takes an id named after its key', () => {
    const field = new FieldViewModel({
      name: 'envFile',
      editable: true,
      highlightKey: 'ignore',
    })

    const id = field.id()

    expect(id).toBe('config-envFile')
  })
})
