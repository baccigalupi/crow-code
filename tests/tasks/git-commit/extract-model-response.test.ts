import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { ExtractModelResponse } from '../../../src/tasks/git-commit/extract-model-response.ts'

describe('ExtractModelResponse', () => {
  it('when the response contains content, parses it', async () => {
    const response = Response.json({
      choices: [{ message: { content: 'answer' } }],
    })
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content.toUpperCase(),
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('ANSWER')
  })

  it('when the response is not ok, parses empty content', async () => {
    const response = Response.json({}, { status: 500 })
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content,
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('')
  })

  it('when choices are missing, parses empty content', async () => {
    const response = Response.json({})
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content,
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('')
  })

  it('when choices are empty, parses empty content', async () => {
    const response = Response.json({ choices: [] })
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content,
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('')
  })

  it('when the message is missing, parses empty content', async () => {
    const response = Response.json({ choices: [{}] })
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content,
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('')
  })

  it('when message content is missing, parses empty content', async () => {
    const response = Response.json({ choices: [{ message: {} }] })
    const extractModelResponse = new ExtractModelResponse(
      response,
      (content) => content,
    )

    const result = await extractModelResponse.extract()

    expect(result).toBe('')
  })
})
