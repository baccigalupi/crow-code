import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { modelAnswer } from '../../../src/model-requests/framework/model-answer.ts'
import { loadFixture } from '../../support/fixtures.ts'

describe('model-answer', () => {
  it('when the response has a usage cost, returns the cost', async () => {
    const json = await loadFixture(
      'model-requests/openrouter-goals-response.json',
    )

    const response = modelAnswer(json)

    expect(response.cost()).toBe(0.0000288)
  })

  it('when the response has no usage cost, returns zero', async () => {
    const json = await loadFixture(
      'model-requests/ollama-goals-response.json',
    )

    const response = modelAnswer(json)

    expect(response.cost()).toBe(0)
  })

  it('when the raw answer is requested, returns the unparsed json', async () => {
    const json = await loadFixture(
      'model-requests/openrouter-goals-response.json',
    )

    const response = modelAnswer(json)

    expect(response.rawAnswer()).toBe(json.choices[0].message.content)
  })

  it('when the answer is plain json, returns the parsed answer', async () => {
    const json = await loadFixture(
      'model-requests/ollama-goals-response.json',
    )

    const response = modelAnswer(json)

    expect(response.answerAsJson()).toEqual([
      'Create API response fixtures for all three providers used in the app',
      'Extract unfiltered JSON payloads from fetch requests for each provider',
      'Use ollama models for free low-cost options',
      'Include the exact JSON responses as they appear in the fetch calls',
      'Generate fixtures using the specified prompt in chat completion requests',
      'Reference .crow/models.json to identify available models',
    ])
  })

  it('when the answer is fenced json, returns the parsed answer', async () => {
    const json = await loadFixture(
      'model-requests/openrouter-goals-response.json',
    )

    const response = modelAnswer(json)

    expect(response.answerAsJson()).toEqual([
      'Create test fixtures for API responses from all three providers used in the app',
      'Get available models from .crow/models.json',
      'Select a low-cost or free model from the ollama providers',
      'Make a chat completion request using the selected model with a prompt',
      'Capture the unfiltered JSON payload from each fetch request',
      'Create test fixtures based on the captured JSON payloads',
    ])
  })
})
