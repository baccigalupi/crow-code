import { describe, expect, it } from 'bun:test'
import { NumberFlag } from '../../../../../src/tools/git/read-only/cli-options/number-flag.ts'

describe('NumberFlag', () => {
  it('when the value is digits, is valid', () => {
    const flag = new NumberFlag({ typed: '-n5', value: '5' })

    const valid = flag.isValid()

    expect(valid).toBe(true)
  })

  it('when the value is not digits, is not valid', () => {
    const flag = new NumberFlag({ typed: '-nx', value: 'x' })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when no value is given, is not valid', () => {
    const flag = new NumberFlag({ typed: '-n', value: undefined })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when the value is empty, is not valid', () => {
    const flag = new NumberFlag({ typed: '--max-count=', value: '' })

    const valid = flag.isValid()

    expect(valid).toBe(false)
  })

  it('when the value is not digits, gives not a number as the reason', () => {
    const flag = new NumberFlag({ typed: '-nx', value: 'x' })

    const reason = flag.reason()

    expect(reason).toBe('notNumber')
  })

  it('when no value is given, gives not allowed as the reason', () => {
    const flag = new NumberFlag({ typed: '-n', value: undefined })

    const reason = flag.reason()

    expect(reason).toBe('notAllowed')
  })

  it('when the value is empty, gives not allowed as the reason', () => {
    const flag = new NumberFlag({ typed: '--max-count=', value: '' })

    const reason = flag.reason()

    expect(reason).toBe('notAllowed')
  })

  it('when the value is attached to the flag, labels it as typed', () => {
    const flag = new NumberFlag({ typed: '--max-count=x', value: 'x' })

    const label = flag.label()

    expect(label).toBe('--max-count=x')
  })

  it('when the value is a separate token, labels the flag and the value', () => {
    const flag = new NumberFlag({ typed: '-n', value: 'x' })

    const label = flag.label()

    expect(label).toBe('-n x')
  })
})
