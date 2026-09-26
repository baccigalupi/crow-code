import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { chatResponse } from '../../src/model-requests/chat-response.ts'
import { loadFixture } from '../support/fixtures.ts'

describe('ChatResponse', () => {
  it('when the response has a usage cost, returns the cost', async () => {
    const json = await loadFixture(
      'model-requests/openrouter-goals-response.json',
    )

    const response = chatResponse(json)

    expect(response.cost()).toBe(0.0000288)
  })

  it('when the response has no usage cost, returns zero', async () => {
    const json = await loadFixture(
      'model-requests/ollama-goals-response.json',
    )

    const response = chatResponse(json)

    expect(response.cost()).toBe(0)
  })
})
