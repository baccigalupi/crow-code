import { describe, expect, it } from 'bun:test'
import { JsonFieldViewModel } from '../../../../../src/tui/install/app/config-preview/json-field-view-model.ts'

describe('JsonFieldViewModel', () => {
  describe('when highlighted', () => {
    it('draws dark on gold', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: true,
        json: '{}',
        last: false,
      })

      const colors = [field.textColor(), field.background()]

      expect(colors).toEqual(['#0a0f1e', '#e6ca6c'])
    })

    it('takes the id the scroll reveals', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: true,
        json: '{}',
        last: false,
      })

      const id = field.id()

      expect(id).toBe('config-highlight')
    })

    it('is keyed by the json, so a new json remounts it', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: true,
        json: '{"envFile":"x"}',
        last: false,
      })

      const key = field.key()

      expect(key).toBe('{"envFile":"x"}')
    })
  })

  describe('when not highlighted', () => {
    it('keeps the default colors', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: false,
        json: '{}',
        last: false,
      })

      const colors = [field.textColor(), field.background()]

      expect(colors).toEqual([undefined, undefined])
    })

    it('takes an id named after its key', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: false,
        json: '{}',
        last: false,
      })

      const id = field.id()

      expect(id).toBe('config-envFile')
    })

    it('is keyed by its name', () => {
      const field = new JsonFieldViewModel({
        name: 'envFile',
        value: '~/.crow/.env',
        highlighted: false,
        json: '{}',
        last: false,
      })

      const key = field.key()

      expect(key).toBe('envFile')
    })
  })

  it('when followed by another key, ends with a comma', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      highlighted: false,
      json: '{}',
      last: false,
    })

    const comma = field.comma()

    expect(comma).toBe(',')
  })

  it('when last in its object, ends without a comma', () => {
    const field = new JsonFieldViewModel({
      name: 'envFile',
      value: '~/.crow/.env',
      highlighted: false,
      json: '{}',
      last: true,
    })

    const comma = field.comma()

    expect(comma).toBe('')
  })
})
