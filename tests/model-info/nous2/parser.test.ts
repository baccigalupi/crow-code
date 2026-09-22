import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadNousFixture } from '../../support/fixtures.ts'
import { parseNousBody } from '../../../src/model-info/nous2/parser.ts'

describe('parseNousBody', () => {
  it('maps id and name through', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] })[0]

    expect(result.id).toBe('test/model')
    expect(result.name).toBe('Test Model')
  })

  it('parses contextLength from context_length', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] })[0]

    expect(result.contextLength).toBe(128000)
  })

  it('multiplies prompt and completion prices by one million', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] })[0]

    expect(result.costInput).toBe(1)
    expect(result.costOutput).toBe(2)
  })

  it('passes supported_parameters through', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] })[0]

    expect(result.supportedParameters).toEqual(['temperature', 'top_p'])
  })

  describe('modality', () => {
    it('when architecture.modality is present, uses the raw value', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: { modality: 'text->text' },
        supported_parameters: ['temperature', 'top_p'],
      }

      const result = parseNousBody({ data: [model] })[0]

      expect(result.modality).toBe('text->text')
    })

    it('when architecture is empty, is unknown', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: {},
        supported_parameters: ['temperature', 'top_p'],
      }

      const result = parseNousBody({ data: [model] })[0]

      expect(result.modality).toBe('unknown')
    })

    it('when architecture is missing, is unknown', () => {
      const model = {
        id: 'test/model',
        name: 'Test Model',
        context_length: 128000,
        pricing: { prompt: '0.000001', completion: '0.000002' },
        architecture: undefined,
        supported_parameters: ['temperature', 'top_p'],
      }

      const result = parseNousBody({ data: [model] })[0]

      expect(result.modality).toBe('unknown')
    })
  })

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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(false)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(false)
    })

    it('when fixture model has no reasoning object, is false', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'unbiased/pareto'
      )

      const result = parseNousBody({ data: [model] })[0]

      expect(result.supportsReasoning).toBe(false)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(false)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(true)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(false)
    })

    it('when fixture model has reasoning mandatory false, is true', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'xiaomi/mimo-v2.6-pro-ultraspeed'
      )

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(true)
    })

    it('when fixture model has reasoning mandatory true, is false', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'z-ai/glm-5.3-flashx'
      )

      const result = parseNousBody({ data: [model] })[0]

      expect(result.canDisableReasoning).toBe(false)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.reasoningOptions).toEqual(reasoning)
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

      const result = parseNousBody({ data: [model] })[0]

      expect(result.reasoningOptions).toEqual({})
    })

    it('when fixture model has rich reasoning, are preserved', async () => {
      const fixture = await loadNousFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'prism-ml/ternary-bonsai-2-27b'
      )

      const result = parseNousBody({ data: [model] })[0]

      expect(result.reasoningOptions.supported_efforts).toEqual([
        'xhigh',
        'medium',
      ])
      expect(result.reasoningOptions.default_effort).toBe('xhigh')
    })
  })

  it('when body has models, maps every record', async () => {
    const fixture = await loadNousFixture()

    const result = parseNousBody(fixture)

    expect(result).toHaveLength(400)
  })
})
