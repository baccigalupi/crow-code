import { describe, it, expect } from 'vitest'
import { parseArguments } from '../../src/model-discovery/parse-args'

describe('parseArguments', () => {
  it('when no arguments are given, returns defaults', () => {
    const result = parseArguments([])

    expect(result.refresh).toBe(false)
    expect(result.sort).toBe('coding')
    expect(result.top).toBe(40)
    expect(result.filter).toBeUndefined()
    expect(result.provider).toBeUndefined()
    expect(result.all).toBe(false)
    expect(result.json).toBe(false)
  })

  it('when --refresh is given, sets refresh to true', () => {
    const result = parseArguments(['--refresh'])

    expect(result.refresh).toBe(true)
  })

  it('when --filter has a value, captures it', () => {
    const result = parseArguments(['--filter', 'qwen'])

    expect(result.filter).toBe('qwen')
  })

  it('when --provider has a value, captures it', () => {
    const result = parseArguments(['--provider', 'ollama'])

    expect(result.provider).toBe('ollama')
  })

  it('when --sort has a known value, sets it', () => {
    const result = parseArguments(['--sort', 'cost'])

    expect(result.sort).toBe('cost')
  })

  it('when --sort has an unknown value, keeps the default', () => {
    const result = parseArguments(['--sort', 'nonsense'])

    expect(result.sort).toBe('coding')
  })

  it('when --top has a number, parses it', () => {
    const result = parseArguments(['--top', '25'])

    expect(result.top).toBe(25)
  })

  it('when --all is given, sets all to true', () => {
    const result = parseArguments(['--all'])

    expect(result.all).toBe(true)
  })

  it('when --json is given, sets json to true', () => {
    const result = parseArguments(['--json'])

    expect(result.json).toBe(true)
  })
})
