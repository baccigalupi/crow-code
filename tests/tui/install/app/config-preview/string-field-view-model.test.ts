import { describe, expect, it } from 'bun:test'
import { StringFieldViewModel } from '../../../../../src/tui/install/app/config-preview/string-field-view-model.ts'

describe('StringFieldViewModel', () => {
  it('when asked for its value, quotes it as json', () => {
    const field = new StringFieldViewModel({
      name: 'envFile',
      value: 'C:\\crow',
      highlighted: false,
      json: '{}',
      last: false,
    })

    const quoted = field.quoted()

    expect(quoted).toBe('"C:\\\\crow"')
  })
})
