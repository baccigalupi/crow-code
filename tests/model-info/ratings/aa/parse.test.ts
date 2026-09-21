import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parsePage } from '../../../../src/model-info/ratings/aa/parse.ts'

describe('parsePage', () => {
  it('when the response is ok, returns the page body', async () => {
    const body = { data: [{ slug: 'x' }], pagination: { has_more: true } }

    const result = await parsePage(Response.json(body))

    expect(result).toEqual(body)
  })

  it('when the response is an error, returns an empty page', async () => {
    const result = await parsePage(Response.error())

    expect(result).toEqual({ data: [], pagination: { has_more: false } })
  })
})
