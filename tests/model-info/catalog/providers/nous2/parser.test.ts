import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadNousFixture } from '../../../../support/fixtures.ts'
import { parseNousBody } from '../../../../../src/model-info/catalog/providers/nous2/parser.ts'

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

    const result = parseNousBody({ data: [model] }, 'nous')[0]

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

    const result = parseNousBody({ data: [model] }, 'nous')[0]

    expect(result.provider).toBe('nous')
  })

  it('never delegates pricing dynamically', () => {
    const model = {
      id: 'test/model',
      name: 'Test Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature', 'top_p'],
    }

    const result = parseNousBody({ data: [model] }, 'nous')[0]

    expect(result.dynamicDelegation).toBe(false)
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

    const result = parseNousBody({ data: [model] }, 'nous')[0]

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

    const result = parseNousBody({ data: [model] }, 'nous')[0]

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

    const result = parseNousBody({ data: [model] }, 'nous')[0]

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

      const result = parseNousBody({ data: [model] }, 'nous')[0]

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

      const result = parseNousBody({ data: [model] }, 'nous')[0]

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

      const result = parseNousBody({ data: [model] }, 'nous')[0]

      expect(result.modality).toBe('unknown')
    })
  })

  it('when body has models, maps every record', async () => {
    const fixture = await loadNousFixture()

    const result = parseNousBody(fixture, 'nous')

    expect(result).toHaveLength(400)
  })
})
