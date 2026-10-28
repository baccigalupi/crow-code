import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { outline } from '../../../src/tools/research/outline.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('outline', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/outline`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/outline`))

  it('when the file defines a function, lists it', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/outline/fly.ts`,
      'function fly(height: number): void {\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/outline/fly.ts`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({
      path,
      language: 'typescript',
      symbols: [
        {
          name: 'fly',
          kind: 'function',
          signature: 'function fly(height: number): void',
          startLine: 1,
          endLine: 2,
          children: [],
        },
      ],
    })
  })

  it('when a class defines a method, nests the method inside the class', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/outline/crow.ts`,
      'class Crow {\n  fly(): void {}\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/outline/crow.ts`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result().symbols).toEqual([
      {
        name: 'Crow',
        kind: 'class',
        signature: 'class Crow',
        startLine: 1,
        endLine: 3,
        children: [
          {
            name: 'fly',
            kind: 'method',
            signature: 'fly(): void',
            startLine: 2,
            endLine: 2,
            children: [],
          },
        ],
      },
    ])
  })

  it('when a signature spans lines, joins it onto one line', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/outline/long.ts`,
      'function fly(\n  height: number,\n): void {\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/outline/long.ts`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result().symbols[0].signature).toBe(
      'function fly( height: number, ): void',
    )
  })

  it('when the file has no grammar, fails with the parse reason', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/outline/notes.md`, '# notes\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = `${fixturesDirectory}/outline/notes.md`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[1][0]).toBe(
      `Code outline: no grammar for path: ${path}`,
    )
  })

  it('when a constant holds an arrow function, signs it without the body', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/outline/arrow.ts`,
      'const fly = (height: number) => {\n  return height\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/outline/arrow.ts`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result().symbols).toEqual([
      {
        name: 'fly',
        kind: 'function',
        signature: 'fly = (height: number) =>',
        startLine: 1,
        endLine: 3,
        children: [],
      },
    ])
  })

  it('when an interface declares a method signature, lists both', async () => {
    mkdirSync(`${fixturesDirectory}/outline`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/outline/bird.ts`,
      'interface Bird {\n  fly(): void\n}\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/outline/bird.ts`

    const file = outline({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result().symbols).toEqual([
      {
        name: 'Bird',
        kind: 'interface',
        signature: 'interface Bird',
        startLine: 1,
        endLine: 3,
        children: [
          {
            name: 'fly',
            kind: 'method',
            signature: 'fly(): void',
            startLine: 2,
            endLine: 2,
            children: [],
          },
        ],
      },
    ])
  })
})
