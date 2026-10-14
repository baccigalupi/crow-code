import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { envPromptViewModel } from '../../../../../src/tui/install/views/steps/env-prompt-view-model.ts'
import { emptyBuffer, insertText } from '../../../../../src/tui/input-buffer.ts'

describe('env-prompt-view-model', () => {
  it('when the global directory is the default, the fallback is ~/.crow/.env', () => {
    const globalDirectory = emptyBuffer()

    const { fallback } = envPromptViewModel({ globalDirectory })

    expect(fallback).toBe('~/.crow/.env')
  })

  it('when the global directory is custom, the fallback is .env inside it', () => {
    const globalDirectory = insertText(emptyBuffer(), '/opt/crow')

    const { fallback } = envPromptViewModel({ globalDirectory })

    expect(fallback).toBe('/opt/crow/.env')
  })
})
