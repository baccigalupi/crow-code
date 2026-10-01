import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadOpenRouterFixture } from '../../../support/fixtures.ts'
import { parseOpenRouterBody } from '../../../../src/model-discovery/populate/openrouter/parser.ts'

describe('parseOpenRouterBody', () => {
  it('maps id and name through', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.id).toBe('test/model')
    expect(result.name).toBe('Test Model')
  })

  it('stamps the provider it is given', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.provider).toBe('openrouter')
    expect(result.provider).not.toBe('openrouter2')
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

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

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

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.costInput).toBe(1)
    expect(result.costOutput).toBe(2)
    expect(result.dynamicDelegation).toBe(false)
  })

  it('keeps free pricing at zero cost', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0', completion: '0' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.costInput).toBe(0)
    expect(result.costOutput).toBe(0)
    expect(result.dynamicDelegation).toBe(false)
  })

  it('marks negative sentinel pricing as dynamic delegation with null costs', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '-1', completion: '-1' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.dynamicDelegation).toBe(true)
    expect(result.costInput).toBeNull()
    expect(result.costOutput).toBeNull()
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

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.supportedParameters).toEqual(['temperature', 'top_p'])
  })

  it('passes empty supported_parameters through as empty', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: [],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.supportedParameters).toEqual([])
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

      const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

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

      const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

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

      const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

      expect(result.modality).toBe('unknown')
    })
  })

  it('maps every fixture record', async () => {
    const fixture = await loadOpenRouterFixture()

    const result = parseOpenRouterBody(fixture, 'openrouter')

    expect(result).toHaveLength(458)
  })

  it('normalizes a fixed-price record with reasoning options', () => {
    const model = {
      id: 'fireworks/ember-1',
      name: 'Fireworks: Ember-1',
      context_length: 1048576,
      pricing: { prompt: '0.000003', completion: '0.000015' },
      architecture: { modality: 'text+image->text' },
      supported_parameters: ['reasoning', 'reasoning_effort', 'temperature'],
      reasoning: {
        mandatory: false,
        default_enabled: true,
        supported_efforts: ['max', 'high', 'low'],
        default_effort: 'max',
      },
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.costInput).toBe(3)
    expect(result.costOutput).toBe(15)
    expect(result.contextLength).toBe(1048576)
    expect(result.modality).toBe('text+image->text')
    expect(result.supportsReasoning).toBe(true)
    expect(result.canDisableReasoning).toBe(true)
    expect(result.reasoningOptions.supported_efforts).toEqual([
      'max',
      'high',
      'low',
    ])
    expect(result.reasoningOptions.default_effort).toBe('max')
    expect(result.dynamicDelegation).toBe(false)
  })

  it('normalizes a router record as dynamic delegation', () => {
    const model = {
      id: 'openrouter/auto',
      name: 'Auto Router',
      context_length: 2000000,
      pricing: { prompt: '-1', completion: '-1' },
      architecture: { modality: 'text+image+file+audio+video->text+image' },
      supported_parameters: ['reasoning', 'reasoning_effort', 'temperature'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.dynamicDelegation).toBe(true)
    expect(result.costInput).toBeNull()
    expect(result.costOutput).toBeNull()
    expect(result.supportsReasoning).toBe(true)
    expect(result.canDisableReasoning).toBe(false)
  })

  it('marks only negative-priced records as dynamic delegation', () => {
    const router = {
      name: 'Router',
      context_length: 2000000,
      pricing: { prompt: '-1', completion: '-1' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const fixed = {
      id: 'vendor/fixed',
      name: 'Fixed Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const data = [
      { ...router, id: 'openrouter/auto' },
      { ...fixed },
      { ...router, id: 'openrouter/auto-beta' },
      { ...router, id: 'openrouter/bodybuilder' },
      { ...router, id: 'openrouter/fusion' },
      { ...router, id: 'openrouter/pareto-code' },
    ]

    const result = parseOpenRouterBody({ data }, 'openrouter')

    expect(result[0].dynamicDelegation).toBe(true)
    expect(result[0].id).toBe('openrouter/auto')
    expect(result[1].dynamicDelegation).toBe(false)
    expect(result[1].id).toBe('vendor/fixed')
    expect(result[2].dynamicDelegation).toBe(true)
    expect(result[2].id).toBe('openrouter/auto-beta')
    expect(result[3].dynamicDelegation).toBe(true)
    expect(result[3].id).toBe('openrouter/bodybuilder')
    expect(result[4].dynamicDelegation).toBe(true)
    expect(result[4].id).toBe('openrouter/fusion')
    expect(result[5].dynamicDelegation).toBe(true)
    expect(result[5].id).toBe('openrouter/pareto-code')
  })

  it('passes empty supported_parameters arrays through unchanged', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const empty = { ...model, supported_parameters: [] }
    const data = [
      { ...empty, id: 'test/one' },
      { ...empty, id: 'test/two' },
      { ...empty, id: 'test/three' },
      { ...model },
    ]

    const result = parseOpenRouterBody({ data }, 'openrouter')

    expect(result[0].supportedParameters).toEqual([])
    expect(result[1].supportedParameters).toEqual([])
    expect(result[2].supportedParameters).toEqual([])
    expect(result[3].supportedParameters).toEqual(['temperature'])
  })

  it('passes context_length through as a number', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(typeof result.contextLength).toBe('number')
  })

  it('emits null costs instead of negative sentinel prices', () => {
    const model = {
      id: 'openrouter/auto',
      name: 'Auto Router',
      context_length: 2000000,
      pricing: { prompt: '-1', completion: '-1' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }

    const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

    expect(result.costInput).toBeNull()
    expect(result.costOutput).toBeNull()
  })
})
