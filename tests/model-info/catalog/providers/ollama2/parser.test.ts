import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadOllamaFixture } from '../../../../support/fixtures.ts'
import { parseOllamaBody } from '../../../../../src/model-info/catalog/providers/ollama2/parser.ts'

describe('parseOllamaBody', () => {
  it('maps id and name through', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.id).toBe('qwen3-coder:30b')
    expect(result.name).toBe('qwen3-coder:30b')
  })

  it('stamps the provider it is given', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.provider).toBe('ollama')
  })

  it('parses contextLength from details.context_length', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.contextLength).toBe(262144)
  })

  it('returns null contextLength when details has no context_length', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
      },
      capabilities: ['completion'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.contextLength).toBeNull()
  })

  it('sets costInput and costOutput to zero', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.costInput).toBe(0)
    expect(result.costOutput).toBe(0)
  })

  it('sets modality to local', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.modality).toBe('local')
  })

  it('sets supportedParameters to an empty list', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.supportedParameters).toEqual([])
  })

  it('never marks dynamic delegation', () => {
    const model = {
      name: 'qwen3-coder:30b',
      model: 'qwen3-coder:30b',
      modified_at: '2026-08-19T20:14:16.454318564-07:00',
      size: 18556700761,
      digest:
        '06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca',
      details: {
        parent_model: '',
        format: 'gguf',
        family: 'qwen3moe',
        families: ['qwen3moe'],
        parameter_size: '30.5B',
        quantization_level: 'Q4_K_M',
        context_length: 262144,
      },
      capabilities: ['completion', 'tools'],
    }

    const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

    expect(result.dynamicDelegation).toBe(false)
  })

  describe('reasoning', () => {
    it('enables reasoning when capabilities includes thinking', () => {
      const model = {
        name: 'x',
        model: 'x',
        modified_at: '',
        size: 0,
        digest: '',
        details: {
          parent_model: '',
          format: '',
          family: '',
          families: null,
          parameter_size: '',
          quantization_level: '',
        },
        capabilities: ['completion', 'thinking'],
      }

      const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

      expect(result.supportsReasoning).toBe(true)
      expect(result.canDisableReasoning).toBe(true)
      expect(result.reasoningOptions.default_enabled).toBe(true)
      expect(result.reasoningOptions.supported_efforts).toEqual([
        'low',
        'medium',
        'high',
        'max',
      ])
    })

    it('disables reasoning when capabilities does not include thinking', () => {
      const model = {
        name: 'x',
        model: 'x',
        modified_at: '',
        size: 0,
        digest: '',
        details: {
          parent_model: '',
          format: '',
          family: '',
          families: null,
          parameter_size: '',
          quantization_level: '',
        },
        capabilities: ['completion'],
      }

      const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

      expect(result.supportsReasoning).toBe(false)
      expect(result.canDisableReasoning).toBe(false)
      expect(result.reasoningOptions).toEqual({})
    })

    it('disables reasoning when capabilities is absent', () => {
      const model = {
        name: 'x',
        model: 'x',
        modified_at: '',
        size: 0,
        digest: '',
        details: {
          parent_model: '',
          format: '',
          family: '',
          families: null,
          parameter_size: '',
          quantization_level: '',
        },
      }

      const result = parseOllamaBody({ models: [model] }, 'ollama')[0]

      expect(result.supportsReasoning).toBe(false)
      expect(result.canDisableReasoning).toBe(false)
      expect(result.reasoningOptions).toEqual({})
    })
  })

  it('returns an empty list when models is empty', () => {
    const result = parseOllamaBody({ models: [] }, 'ollama')

    expect(result).toEqual([])
  })

  describe('fixture', () => {
    it('maps every record', async () => {
      const fixture = await loadOllamaFixture()

      const result = parseOllamaBody(fixture, 'ollama')

      expect(result).toHaveLength(3)
    })

    it('normalizes qwen3-coder without reasoning', async () => {
      const fixture = await loadOllamaFixture()

      const result = parseOllamaBody(fixture, 'ollama')

      expect(result[0].id).toBe('qwen3-coder:30b')
      expect(result[0].contextLength).toBe(262144)
      expect(result[0].supportsReasoning).toBe(false)
      expect(result[0].reasoningOptions).toEqual({})
    })

    it('normalizes laguna with reasoning and context length', async () => {
      const fixture = await loadOllamaFixture()

      const result = parseOllamaBody(fixture, 'ollama')

      expect(result[1].id).toBe('laguna-xs-2.1:latest')
      expect(result[1].contextLength).toBe(262144)
      expect(result[1].supportsReasoning).toBe(true)
      expect(result[1].reasoningOptions.default_enabled).toBe(true)
    })

    it('normalizes gemma4 with reasoning but no context length', async () => {
      const fixture = await loadOllamaFixture()

      const result = parseOllamaBody(fixture, 'ollama')

      expect(result[2].id).toBe('gemma4:26b')
      expect(result[2].contextLength).toBeNull()
      expect(result[2].supportsReasoning).toBe(true)
    })
  })
})
