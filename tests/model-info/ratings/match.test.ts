import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { candidateIds } from '../../../src/model-info/ratings/match.ts'

describe('candidateIds', () => {
  it('when the creator is unknown, returns no candidates', () => {
    const result = candidateIds('some-model', 'Unknown Corp')

    expect(result).toEqual([])
  })

  it('when the creator is known, prefixes the slug', () => {
    const result = candidateIds('deepseek-v3', 'DeepSeek')

    expect(result).toContain('deepseek/deepseek-v3')
  })

  it('when the slug has an effort suffix, also emits the stripped id', () => {
    const result = candidateIds('gpt-5-high', 'OpenAI')

    expect(result).toContain('openai/gpt-5')
  })

  it('when the slug has a date suffix, also emits the stripped id', () => {
    const result = candidateIds('model-2025', 'Xiaomi')

    expect(result).toContain('xiaomi/model')
  })

  it('when the slug has a mode suffix, also emits the stripped id', () => {
    const result = candidateIds('gpt-5-reasoning', 'OpenAI')

    expect(result).toContain('openai/gpt-5')
  })
})
