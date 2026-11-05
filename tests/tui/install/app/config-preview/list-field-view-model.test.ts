import { describe, expect, it } from 'bun:test'
import { ListFieldViewModel } from '../../../../../src/tui/install/app/config-preview/list-field-view-model.ts'

describe('ListFieldViewModel', () => {
  it('when asked for its items, numbers each one and marks the last', () => {
    const field = new ListFieldViewModel({
      name: 'escalateWrite',
      value: ['./dev', './agent'],
      last: false,
      editable: true,
      highlightKey: 'ignore',
    })

    const items = field.items()

    expect(items).toEqual([
      { index: 0, value: './dev', last: false },
      { index: 1, value: './agent', last: true },
    ])
  })
})
