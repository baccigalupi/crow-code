import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadOpenRouterFixture } from '../../../../support/fixtures.ts'
import { parseOpenRouterBody } from '../../../../../src/model-info/catalog/providers/openrouter2/parser.ts'

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

  describe('fixture', () => {
    it('maps every record', async () => {
      const fixture = await loadOpenRouterFixture()

      const result = parseOpenRouterBody(fixture, 'openrouter')

      expect(result).toHaveLength(458)
    })

    it('normalizes a fixed-price record', async () => {
      const fixture = await loadOpenRouterFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'fireworks/ember-1'
      )

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

    it('normalizes the auto router as dynamic delegation', async () => {
      const fixture = await loadOpenRouterFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'openrouter/auto'
      )

      const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

      expect(result.dynamicDelegation).toBe(true)
      expect(result.costInput).toBeNull()
      expect(result.costOutput).toBeNull()
      expect(result.supportsReasoning).toBe(true)
      expect(result.canDisableReasoning).toBe(false)
    })

    it('normalizes a free record at zero cost', async () => {
      const fixture = await loadOpenRouterFixture()
      const model = fixture.data.find((model: { id: string }) =>
        model.id === 'openrouter/free'
      )

      const result = parseOpenRouterBody({ data: [model] }, 'openrouter')[0]

      expect(result.dynamicDelegation).toBe(false)
      expect(result.costInput).toBe(0)
      expect(result.costOutput).toBe(0)
    })

    it('marks exactly the five router records as dynamic delegation', async () => {
      const fixture = await loadOpenRouterFixture()

      const result = parseOpenRouterBody(fixture, 'openrouter')
      const dynamic = result
        .filter((model) => model.dynamicDelegation)
        .map((model) => model.id)
        .sort()

      expect(dynamic).toEqual([
        'openrouter/auto',
        'openrouter/auto-beta',
        'openrouter/bodybuilder',
        'openrouter/fusion',
        'openrouter/pareto-code',
      ])
    })

    it('preserves exactly three empty supported_parameters arrays', async () => {
      const fixture = await loadOpenRouterFixture()

      const result = parseOpenRouterBody(fixture, 'openrouter')
      const empty = result.filter((model) =>
        model.supportedParameters.length === 0
      )

      expect(empty).toHaveLength(3)
    })

    it('gives every record a numeric contextLength', async () => {
      const fixture = await loadOpenRouterFixture()

      const result = parseOpenRouterBody(fixture, 'openrouter')
      const numeric = result.every((model) =>
        typeof model.contextLength === 'number'
      )

      expect(numeric).toBe(true)
    })

    it('never emits a negative cost', async () => {
      const fixture = await loadOpenRouterFixture()

      const result = parseOpenRouterBody(fixture, 'openrouter')
      const negative = result.filter((model) =>
        (model.costInput !== null && model.costInput < 0) ||
        (model.costOutput !== null && model.costOutput < 0)
      )

      expect(negative).toEqual([])
    })
  })
})
