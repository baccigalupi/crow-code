import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseGoals } from '../../../src/plan/goals/parse-goals.ts'

describe('parseGoals', () => {
  it('when input is a JSON array of strings, returns the strings', () => {
    const raw = '["ship the CLI", "write tests"]'

    const goals = parseGoals(raw)

    expect(goals).toEqual(['ship the CLI', 'write tests'])
  })

  it('when input is fenced JSON, returns the strings', () => {
    const raw = '```json\n["ship the CLI"]\n```'

    const goals = parseGoals(raw)

    expect(goals).toEqual(['ship the CLI'])
  })

  it('when input is not JSON, returns an empty list', () => {
    const raw = 'not json'

    const goals = parseGoals(raw)

    expect(goals).toEqual([])
  })

  it('when input is a JSON object, returns an empty list', () => {
    const raw = '{"goal": "ship the CLI"}'

    const goals = parseGoals(raw)

    expect(goals).toEqual([])
  })

  it('when the array has non-string elements, returns an empty list', () => {
    const raw = '["ship the CLI", 42]'

    const goals = parseGoals(raw)

    expect(goals).toEqual([])
  })
})
