import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { envPromptViewModel } from '../../../../../src/tui/install/views/steps/env-prompt-view-model.ts'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('env-prompt-view-model', () => {
  it('when the global directory is the default, the default value is ~/.crow/.env', () => {
    const globalDirectory = emptyBuffer()

    const { defaultValue } = envPromptViewModel({ globalDirectory })

    expect(defaultValue).toBe('~/.crow/.env')
  })

  it('when the global directory is custom, the default value is .env inside it', () => {
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')

    const { defaultValue } = envPromptViewModel({ globalDirectory })

    expect(defaultValue).toBe('/opt/crow/.env')
  })
})
