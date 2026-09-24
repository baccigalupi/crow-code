import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  loadNousFixture,
  loadOpenRouterFixture,
} from '../../../support/fixtures.ts'
import { ReasoningParser } from '../../../../src/model-info/catalog/providers/reasoning-parser.ts'

describe('ReasoningParser', () => {
  describe('supportsReasoning', () => {
    it('when reasoning object is present, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: { mandatory: false },
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(true)
    })

    it('when reasoning object is absent and no reasoning params, is false', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(false)
    })

    it('when supported_parameters contains reasoning, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['reasoning', 'temperature'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(true)
    })

    it('when supported_parameters contains include_reasoning, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['include_reasoning', 'temperature'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(true)
    })

    it('when supported_parameters contains reasoning_effort, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['reasoning_effort', 'temperature'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(true)
    })

    it('when modality is embeddings, is false', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->embeddings' },
        supported_parameters: ['reasoning', 'include_reasoning'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(false)
    })

    it('when fixture model has no reasoning object, is false', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'unbiased/pareto'
      )

      const result = new ReasoningParser(model).supportsReasoning()

      expect(result).toBe(false)
    })
  })

  describe('canDisableReasoning', () => {
    it('when reasoning object is present and mandatory is true, is false', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: { mandatory: true },
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(false)
    })

    it('when reasoning object is present and mandatory is false, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: { mandatory: false },
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(true)
    })

    it('when reasoning object is present without mandatory, is true', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: {},
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(true)
    })

    it('when reasoning object is absent, is false', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(false)
    })

    it('when fixture model has reasoning mandatory false, is true', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'xiaomi/mimo-v2.6-pro-ultraspeed'
      )

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(true)
    })

    it('when fixture model has reasoning mandatory true, is false', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'z-ai/glm-5.3-flashx'
      )

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(false)
    })

    it('when openrouter fixture model has reasoning mandatory true, is false', async () => {
      const fixture = await loadOpenRouterFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'moonshotai/kimi-k2.7-code'
      )

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(false)
    })
  })

  describe('reasoningOptions', () => {
    it('when reasoning object is present, is preserved', () => {
      const reasoning = {
        mandatory: false,
        default_enabled: true,
        default_effort: 'high',
        supported_efforts: ['low', 'high'],
        supports_max_tokens: true,
      }
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning,
      }

      const result = new ReasoningParser(model).reasoningOptions()

      expect(result).toEqual(reasoning)
    })

    it('when reasoning object is absent, is empty', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
        reasoning: undefined,
      }

      const result = new ReasoningParser(model).reasoningOptions()

      expect(result).toEqual({})
    })

    it('when fixture model has rich reasoning, are preserved', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'prism-ml/ternary-bonsai-2-27b'
      )

      const result = new ReasoningParser(model).reasoningOptions()

      expect(result.supported_efforts).toEqual([
        'xhigh',
        'medium',
      ])
      expect(result.default_effort).toBe('xhigh')
    })
  })
})
