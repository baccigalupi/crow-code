import { describe, it, expect } from 'vitest'
import { candidateIds } from '../../../src/model-discovery/ratings/aa-match'

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
})
