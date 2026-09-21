import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  aliasFor,
  normalizeServingId,
} from '../../../../src/model-info/ratings/models-dev/identity.ts'

describe('identity', () => {
  it('when the id has no serving suffix, returns it unchanged', () => {
    expect(normalizeServingId('deepseek/deepseek-v4')).toBe(
      'deepseek/deepseek-v4',
    )
  })

  it('when the id ends with a tilde, strips it', () => {
    expect(normalizeServingId('openrouter/sonoma~')).toBe('openrouter/sonoma')
  })

  it('when the id has a :batch suffix, strips it', () => {
    expect(normalizeServingId('openai/gpt-5:batch')).toBe('openai/gpt-5')
  })

  it('when the id has a :free suffix, strips it', () => {
    expect(normalizeServingId('deepseek/deepseek-v4:free')).toBe(
      'deepseek/deepseek-v4',
    )
  })

  it('when the id has a :US regional suffix, strips it', () => {
    expect(normalizeServingId('moonshotai/kimi-k3:US')).toBe(
      'moonshotai/kimi-k3',
    )
    expect(normalizeServingId('deepseek/deepseek-v4-flash-0731:US')).toBe(
      'deepseek/deepseek-v4-flash-0731',
    )
    expect(normalizeServingId('z-ai/glm-5.3-flash:US')).toBe(
      'z-ai/glm-5.3-flash',
    )
    expect(normalizeServingId('z-ai/glm-5.3:US')).toBe('z-ai/glm-5.3')
  })

  it('when the id is a Nous serving alias, maps to the base model', () => {
    expect(aliasFor('openai/gpt-6-astra-flex')).toBe('openai/gpt-6-astra')
    expect(aliasFor('openai/gpt-6-astra-pro-fast')).toBe(
      'openai/gpt-6-astra-pro',
    )
    expect(aliasFor('openai/gpt-6-astra-pro-flex')).toBe(
      'openai/gpt-6-astra-pro',
    )
  })

  it('when the id is an Ollama local alias, maps to the canonical model', () => {
    expect(aliasFor('laguna-xs-2.1:latest')).toBe('poolside/laguna-xs-2.1')
    expect(aliasFor('gemma4:26b')).toBe('google/gemma-4-26b-a4b-it')
  })

  it('when the id has no alias, returns undefined', () => {
    expect(aliasFor('deepseek/deepseek-v4')).toBeUndefined()
  })
})
