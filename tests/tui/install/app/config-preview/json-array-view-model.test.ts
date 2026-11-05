import { describe, expect, it } from 'bun:test'
import { JsonArrayViewModel } from '../../../../../src/tui/install/app/config-preview/json-array-view-model.ts'

describe('JsonArrayViewModel', () => {
  it('when the array has items, writes one per line', () => {
    const array = new JsonArrayViewModel(['./dev', './agent'])

    const json = array.json()

    expect(json).toBe('[\n  "./dev",\n  "./agent"\n]')
  })

  it('when the array is empty, writes empty brackets', () => {
    const array = new JsonArrayViewModel([])

    const json = array.json()

    expect(json).toBe('[]')
  })
})
