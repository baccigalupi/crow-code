import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadNousFixture } from '../../support/fixtures.ts'
import { parseNousBody } from '../../../src/model-info/nous2/parser.ts'

describe('parseNousBody', () => {
  it('when id and name are present, maps them through', () => {
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

  it('when context_length is present, parses contextLength', () => {
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

  it('when pricing is present, multiplies prompt and completion by one million', () => {
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

  it('when pricing strings are zero, costs are zero', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.0000000000', completion: '0' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] })[0]

    expect(result.costInput).toBe(0)
    expect(result.costOutput).toBe(0)
  })

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

  it('when architecture is empty, modality is unknown', () => {
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

  it('when architecture is missing, modality is unknown', () => {
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

  it('when supported_parameters are present, passes them through', () => {
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

  it('when reasoning object is present, supportsReasoning is true', () => {
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

  it('when reasoning object is absent, supportsReasoning is false', () => {
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

  it('when reasoning.mandatory is true, canDisableReasoning is false', () => {
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

  it('when reasoning.mandatory is false, canDisableReasoning is true', () => {
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

  it('when reasoning object is absent, canDisableReasoning is false', () => {
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

  it('when reasoning object is present, reasoningOptions is preserved', () => {
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

  it('when reasoning object is absent, reasoningOptions is empty', () => {
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

  it('when body has models, maps every record', async () => {
    const fixture = await loadNousFixture()

    const result = parseNousBody(fixture)

    expect(result).toHaveLength(fixture.data.length)
  })

  it('when fixture model has reasoning mandatory false, canDisableReasoning is true', async () => {
    const fixture = await loadNousFixture()
    const model = fixture.data.find((model: { id: string }) =>
      model.id === 'xiaomi/mimo-v2.6-pro-ultraspeed'
    )

    const result = parseNousBody({ data: [model] })[0]

    expect(result.supportsReasoning).toBe(true)
    expect(result.canDisableReasoning).toBe(true)
    expect(result.reasoningOptions).toEqual({ mandatory: false })
  })

  it('when fixture model has reasoning mandatory true, canDisableReasoning is false', async () => {
    const fixture = await loadNousFixture()
    const model = fixture.data.find((model: { id: string }) =>
      model.id === 'z-ai/glm-5.3-flashx'
    )

    const result = parseNousBody({ data: [model] })[0]

    expect(result.supportsReasoning).toBe(true)
    expect(result.canDisableReasoning).toBe(false)
  })

  it('when fixture model has no reasoning object, supportsReasoning is false', async () => {
    const fixture = await loadNousFixture()
    const model = fixture.data.find((model: { id: string }) =>
      model.id === 'unbiased/pareto'
    )

    const result = parseNousBody({ data: [model] })[0]

    expect(result.supportsReasoning).toBe(false)
    expect(result.canDisableReasoning).toBe(false)
    expect(result.reasoningOptions).toEqual({})
  })

  it('when fixture model has rich reasoning, reasoningOptions are preserved', async () => {
    const fixture = await loadNousFixture()
    const model = fixture.data.find((model: { id: string }) =>
      model.id === 'prism-ml/ternary-bonsai-2-27b'
    )

    const result = parseNousBody({ data: [model] })[0]

    expect(result.supportsReasoning).toBe(true)
    expect(result.canDisableReasoning).toBe(true)
    expect(result.reasoningOptions.supported_efforts).toEqual([
      'xhigh',
      'medium',
    ])
    expect(result.reasoningOptions.default_effort).toBe('xhigh')
  })
})
