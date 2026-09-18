import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parse } from '../../../src/plan/goals/parse.ts'

describe('parse', () => {
  it('when input is a JSON array of strings, returns the strings', () => {
    const raw = '["ship the CLI", "write tests"]'

    const goals = parse(raw)

    expect(goals).toEqual(['ship the CLI', 'write tests'])
  })

  it('when input is fenced JSON, returns the strings', () => {
    const raw = '```json\n["ship the CLI"]\n```'

    const goals = parse(raw)

    expect(goals).toEqual(['ship the CLI'])
  })

  it('when input is not JSON, returns an empty list', () => {
    const raw = 'not json'

    const goals = parse(raw)

    expect(goals).toEqual([])
  })

  it('when input is a JSON object, returns an empty list', () => {
    const raw = '{"goal": "ship the CLI"}'

    const goals = parse(raw)

    expect(goals).toEqual([])
  })

  it('when the array has non-string elements, returns an empty list', () => {
    const raw = '["ship the CLI", 42]'

    const goals = parse(raw)

    expect(goals).toEqual([])
  })
})
