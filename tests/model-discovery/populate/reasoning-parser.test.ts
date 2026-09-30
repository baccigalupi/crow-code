import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { ReasoningParser } from '../../../src/model-discovery/populate/reasoning-parser.ts'

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

    it('when nous model has no reasoning object, is false', () => {
      const model = {
        id: 'unbiased/pareto',
        name: 'Pareto',
        context_length: 262144,
        pricing: { prompt: '0.0000025000', completion: '0.0000075000' },
        architecture: { modality: 'text+image->text' },
        supported_parameters: [
          'max_tokens',
          'temperature',
          'tool_choice',
          'tools',
          'top_p',
        ],
        reasoning: undefined,
      }

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

    it('when nous model has reasoning mandatory false, is true', () => {
      const model = {
        id: 'xiaomi/mimo-v2.6-pro-ultraspeed',
        name: 'Xiaomi: MiMo-V2.6-Pro-UltraSpeed',
        context_length: 1048576,
        pricing: { prompt: '0.0000043500', completion: '0.0000087000' },
        architecture: { modality: 'text+image+audio+video->text' },
        supported_parameters: [
          'frequency_penalty',
          'include_reasoning',
          'max_tokens',
          'presence_penalty',
          'reasoning',
          'response_format',
          'stop',
          'structured_outputs',
          'temperature',
          'tool_choice',
          'tools',
          'top_p',
        ],
        reasoning: { mandatory: false },
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(true)
    })

    it('when nous model has reasoning mandatory true, is false', () => {
      const model = {
        id: 'z-ai/glm-5.3-flashx',
        name: 'Z.ai: GLM 5.3 FlashX',
        context_length: 1048576,
        pricing: { prompt: '0.0000003700', completion: '0.0000012500' },
        architecture: { modality: 'text+image+video->text' },
        supported_parameters: [
          'include_reasoning',
          'max_tokens',
          'reasoning',
          'reasoning_effort',
          'response_format',
          'temperature',
          'tool_choice',
          'tools',
          'top_k',
          'top_p',
        ],
        reasoning: {
          mandatory: true,
          default_enabled: true,
          supported_efforts: ['max', 'high', 'low'],
          default_effort: 'max',
        },
      }

      const result = new ReasoningParser(model).canDisableReasoning()

      expect(result).toBe(false)
    })

    it('when openrouter model has reasoning mandatory true, is false', () => {
      const model = {
        id: 'moonshotai/kimi-k2.7-code',
        name: 'MoonshotAI: Kimi K2.7 Code',
        context_length: 262144,
        pricing: { prompt: '0.0000006562', completion: '0.0000033' },
        architecture: { modality: 'text+image->text' },
        supported_parameters: [
          'frequency_penalty',
          'include_reasoning',
          'logit_bias',
          'logprobs',
          'max_tokens',
          'min_p',
          'parallel_tool_calls',
          'presence_penalty',
          'reasoning',
          'repetition_penalty',
          'response_format',
          'seed',
          'stop',
          'structured_outputs',
          'temperature',
          'tool_choice',
          'tools',
          'top_k',
          'top_logprobs',
          'top_p',
        ],
        reasoning: { mandatory: true, default_enabled: true },
      }

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

    it('when nous model has rich reasoning, are preserved', () => {
      const model = {
        id: 'prism-ml/ternary-bonsai-2-27b',
        name: 'PrismML: Ternary Bonsai 2 27B',
        context_length: 262144,
        pricing: { prompt: '0.0000000750', completion: '0.0000005000' },
        architecture: { modality: 'text+image->text' },
        supported_parameters: [
          'frequency_penalty',
          'include_reasoning',
          'logprobs',
          'max_tokens',
          'presence_penalty',
          'reasoning',
          'reasoning_effort',
          'repetition_penalty',
          'response_format',
          'seed',
          'stop',
          'structured_outputs',
          'temperature',
          'tool_choice',
          'tools',
          'top_k',
          'top_logprobs',
          'top_p',
        ],
        reasoning: {
          mandatory: false,
          default_enabled: true,
          supported_efforts: ['xhigh', 'medium'],
          default_effort: 'xhigh',
        },
      }

      const result = new ReasoningParser(model).reasoningOptions()

      expect(result.supported_efforts).toEqual(['xhigh', 'medium'])
      expect(result.default_effort).toBe('xhigh')
    })
  })
})
