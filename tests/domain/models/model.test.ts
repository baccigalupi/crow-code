import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  modelEntities,
  ModelEntity,
  modelEntity,
} from '../../../src/domain/models/model.ts'
import type { ModelRow } from '../../../src/domain/types.ts'

describe('model', () => {
  it('exposes pass-through attributes', () => {
    const row: ModelRow = {
      id: 1,
      provider_id: 2,
      identifier: 'author/model',
      name: 'Model',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '["temperature"]',
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: '{"mandatory":false}',
    }

    const model = modelEntity(row) as ModelEntity

    expect(model.id()).toBe(1)
    expect(model.providerId()).toBe(2)
    expect(model.identifier()).toBe('author/model')
    expect(model.name()).toBe('Model')
    expect(model.contextLength()).toBe(128000)
    expect(model.costInput()).toBe(1.5)
    expect(model.costOutput()).toBe(3)
    expect(model.dynamicDelegation()).toBe(false)
    expect(model.modality()).toBe('text->text')
    expect(model.supportedParameters()).toEqual(['temperature'])
    expect(model.supportsReasoning()).toBe(true)
    expect(model.canDisableReasoning()).toBe(true)
    expect(model.reasoningOptions()).toEqual({ mandatory: false })
  })

  it('when row is undefined, returns a null model', () => {
    const model = modelEntity()

    expect(model.dynamicDelegation()).toBe(false)
    expect(model.supportedParameters()).toEqual([])
    expect(model.supportsReasoning()).toBe(false)

    expect(model.canDisableReasoning()).toBe(false)
    expect(model.reasoningOptions()).toEqual({})
  })

  it('modelEntities maps every row to a ModelEntity', () => {
    const first: ModelRow = {
      id: 1,
      provider_id: 2,
      identifier: 'author/first',
      name: 'First',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '["temperature"]',
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: '{"mandatory":false}',
    }
    const second: ModelRow = {
      id: 2,
      provider_id: 2,
      identifier: 'author/second',
      name: 'Second',
      context_length: 128000,
      cost_input: 1.5,
      cost_output: 3,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '["temperature"]',
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: '{"mandatory":false}',
    }

    const models = modelEntities([first, second])

    expect(models).toHaveLength(2)
    expect(models[0]).toBeInstanceOf(ModelEntity)
    expect(models[1]).toBeInstanceOf(ModelEntity)
    expect(models[0].identifier()).toBe('author/first')
    expect(models[1].identifier()).toBe('author/second')
  })
})
