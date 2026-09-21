import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  aliasFor,
  normalizeServingId,
  resolveServingId,
} from '../../../../src/model-info/ratings/models-dev/identity.ts'

describe('identity', () => {
  it('when the id has no serving suffix, returns it unchanged', () => {
    const result = normalizeServingId('deepseek/deepseek-v4')

    expect(result).toBe('deepseek/deepseek-v4')
  })

  it('when the id ends with a tilde, strips it', () => {
    const result = normalizeServingId('openrouter/sonoma~')

    expect(result).toBe('openrouter/sonoma')
  })

  it('when the id has a :batch suffix, strips it', () => {
    const result = normalizeServingId('openai/gpt-5:batch')

    expect(result).toBe('openai/gpt-5')
  })

  it('when the id has a :free suffix, strips it', () => {
    const result = normalizeServingId('deepseek/deepseek-v4:free')

    expect(result).toBe('deepseek/deepseek-v4')
  })

  it('when the id has a :US regional suffix, strips it', () => {
    const kimi = normalizeServingId('moonshotai/kimi-k3:US')
    const flash = normalizeServingId('deepseek/deepseek-v4-flash-0731:US')
    const glmFlash = normalizeServingId('z-ai/glm-5.3-flash:US')
    const glm = normalizeServingId('z-ai/glm-5.3:US')

    expect(kimi).toBe('moonshotai/kimi-k3')
    expect(flash).toBe('deepseek/deepseek-v4-flash-0731')
    expect(glmFlash).toBe('z-ai/glm-5.3-flash')
    expect(glm).toBe('z-ai/glm-5.3')
  })

  it('when the id is a Nous serving alias, maps to the base model', () => {
    const flex = aliasFor('openai/gpt-6-astra-flex')
    const fast = aliasFor('openai/gpt-6-astra-pro-fast')
    const proFlex = aliasFor('openai/gpt-6-astra-pro-flex')

    expect(flex).toBe('openai/gpt-6-astra')
    expect(fast).toBe('openai/gpt-6-astra-pro')
    expect(proFlex).toBe('openai/gpt-6-astra-pro')
  })

  it('when the id is an Ollama local alias, maps to the canonical model', () => {
    const laguna = aliasFor('laguna-xs-2.1:latest')
    const gemma = aliasFor('gemma4:26b')

    expect(laguna).toBe('poolside/laguna-xs-2.1')
    expect(gemma).toBe('google/gemma-4-26b-a4b-it')
  })

  it('when the id has no alias, returns undefined', () => {
    const result = aliasFor('deepseek/deepseek-v4')

    expect(result).toBeUndefined()
  })

  it('when the id is a serving alias, resolveServingId returns the alias', () => {
    const result = resolveServingId('laguna-xs-2.1:latest')

    expect(result).toBe('poolside/laguna-xs-2.1')
  })

  it('when the id has no alias, resolveServingId returns the normalized id', () => {
    const result = resolveServingId('openai/gpt-5:batch')

    expect(result).toBe('openai/gpt-5')
  })
})
