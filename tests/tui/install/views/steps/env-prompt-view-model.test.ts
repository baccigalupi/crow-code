import { describe, expect, it } from 'bun:test'
import { envPromptViewModel } from '../../../../../src/tui/install/views/steps/env-prompt-view-model.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'

describe('env-prompt-view-model', () => {
  it('when the global directory is the default, the default value is ~/.crow/.env', () => {
    const globalDirectory = emptyText()

    const { defaultValue } = envPromptViewModel({ globalDirectory })

    expect(defaultValue).toBe('~/.crow/.env')
  })

  it('when the global directory is custom, the default value is .env inside it', () => {
    const globalDirectory = insertText(emptyText(), '/opt/crow')

    const { defaultValue } = envPromptViewModel({ globalDirectory })

    expect(defaultValue).toBe('/opt/crow/.env')
  })
})
