import { describe, expect, it } from 'bun:test'
import { JsonFieldViewModel } from '../../../../../src/tui/install/app/config-preview/json-field-view-model.ts'

describe('JsonFieldViewModel', () => {
  describe('when the highlighted key is its name', () => {
    it('draws dark on gold', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        last: false,
        editable: true,
        highlightKey: 'envFile',
      })

      const colors = [field.textColor(), field.background()]

      expect(colors).toEqual(['#0a0f1e', '#e6ca6c'])
    })

    it('takes the id the scroll reveals', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        last: false,
        editable: true,
        highlightKey: 'envFile',
      })

      const id = field.id()

      expect(id).toBe('config-highlight')
    })

    it('when not editable, stays unhighlighted', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        last: false,
        editable: false,
        highlightKey: 'envFile',
      })

      const id = field.id()

      expect(id).toBe('config-envFile')
    })
  })

  it('when another key is highlighted, keeps the default colors', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      last: false,
      editable: true,
      highlightKey: 'ignore',
    })

    const colors = [field.textColor(), field.background()]

    expect(colors).toEqual([undefined, undefined])
  })

  it('when another key is highlighted, takes an id named after its key', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      last: false,
      editable: true,
      highlightKey: 'ignore',
    })

    const id = field.id()

    expect(id).toBe('config-envFile')
  })

  it('when asked for its key, gives its value as json so a new value remounts it', () => {
    const field = new JsonFieldViewModel({
      name: 'escalateWrite',
      value: ['./dev'],
      last: false,
      editable: true,
      highlightKey: 'ignore',
    })

    const key = field.key()

    expect(key).toBe('["./dev"]')
  })

  it('when followed by another key, ends with a comma', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      last: false,
      editable: true,
      highlightKey: 'ignore',
    })

    const comma = field.comma()

    expect(comma).toBe(',')
  })

  it('when last in its object, ends without a comma', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      last: true,
      editable: true,
      highlightKey: 'ignore',
    })

    const comma = field.comma()

    expect(comma).toBe('')
  })
})
