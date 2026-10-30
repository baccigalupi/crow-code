import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { readSymbol } from '../../../src/tools/research/read-symbol.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('readSymbol', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/read-symbol`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/read-symbol`))

  it('when the file defines the named function, returns its source', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/fly.ts`,
      'const x = 1\nfunction fly(): void {\n  go()\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/fly.ts`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.result()).toEqual({
      path,
      name: 'fly',
      kind: 'function',
      startLine: 2,
      endLine: 4,
      docComment: '',
      source: 'function fly(): void {\n  go()\n}',
    })
  })

  it('when no symbol has the name, fails naming it', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/fly.ts`,
      'function fly(): void {}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/fly.ts`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'land' },
    })
    await symbol.run()

    expect(symbol.success()).toBe(false)
    expect(symbol.reason).toBe(`symbol not found: ${path}::land`)
  })

  it('when the name is dotted, returns the method inside the named class', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/crow.ts`,
      'class Crow {\n  fly(): void {}\n}\nfunction fly() {}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/crow.ts`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'Crow.fly' },
    })
    await symbol.run()

    expect(symbol.result()).toEqual({
      path,
      name: 'Crow.fly',
      kind: 'method',
      startLine: 2,
      endLine: 2,
      docComment: '',
      source: '  fly(): void {}',
    })
  })

  it('when the name matches more than one symbol, fails listing each match', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/crow.ts`,
      'class Crow {\n  fly(): void {}\n}\nfunction fly() {}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/crow.ts`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.success()).toBe(false)
    expect(symbol.reason).toBe(
      `ambiguous symbol: ${path}::fly (lines 2-2), ${path}::fly (lines 4-4)`,
    )
  })

  it('when a comment sits above an exported function, returns it as the doc comment', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/doc.ts`,
      '/** Flies high. */\nexport function fly(): void {}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/doc.ts`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.result()).toEqual({
      path,
      name: 'fly',
      kind: 'function',
      startLine: 2,
      endLine: 2,
      docComment: '/** Flies high. */',
      source: 'export function fly(): void {}',
    })
  })

  it('when a comment sits above a python function, returns it as the doc comment', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/fly.py`,
      '# Flies.\ndef fly():\n    pass\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/fly.py`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.result()).toEqual({
      path,
      name: 'fly',
      kind: 'function',
      startLine: 2,
      endLine: 3,
      docComment: '# Flies.',
      source: 'def fly():\n    pass',
    })
  })

  it('when a python function has a docstring, returns it as the doc comment', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/read-symbol/docstring.py`,
      'def fly():\n    """Flies."""\n    pass\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/docstring.py`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.result()).toEqual({
      path,
      name: 'fly',
      kind: 'function',
      startLine: 1,
      endLine: 3,
      docComment: '"""Flies."""',
      source: 'def fly():\n    """Flies."""\n    pass',
    })
  })

  it('when the file has no grammar, fails with the parse reason', async () => {
    mkdirSync(`${fixturesDirectory}/read-symbol`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/read-symbol/notes.txt`, 'fly\n')
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/read-symbol/notes.txt`

    const symbol = readSymbol({
      applicationData,
      operationArguments: { path, name: 'fly' },
    })
    await symbol.run()

    expect(symbol.success()).toBe(false)
    expect(symbol.reason).toBe(`no grammar for path: ${path}`)
  })
})
