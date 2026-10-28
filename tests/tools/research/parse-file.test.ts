import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseFile } from '../../../src/tools/research/parse-file.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('parseFile', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/parse-file`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/parse-file`))

  it('when the file has a grammar, returns its syntax tree', async () => {
    mkdirSync(`${fixturesDirectory}/parse-file`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/parse-file/crow.ts`, 'class Crow {}\n')
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/parse-file/crow.ts`

    const file = parseFile({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result().path).toBe(path)
    expect(file.result().language).toBe('typescript')
    expect(file.result().tree!.rootNode.firstChild!.type).toBe(
      'class_declaration',
    )
  })

  it('when the code is broken, still returns a tree marked with errors', async () => {
    mkdirSync(`${fixturesDirectory}/parse-file`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/parse-file/broken.ts`,
      'function fly( {\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/parse-file/broken.ts`

    const file = parseFile({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result().tree!.rootNode.hasError).toBe(true)
  })

  it('when the file has no grammar, fails', async () => {
    mkdirSync(`${fixturesDirectory}/parse-file`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/parse-file/notes.md`, '# notes\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = `${fixturesDirectory}/parse-file/notes.md`

    const file = parseFile({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Parse file: no grammar for path: ${path}`,
    )
  })

  it('when the path is outside the allowed directories, fails', async () => {
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = resolve(process.cwd(), '..', 'outside.ts')

    const file = parseFile({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Parse file: path not allowed: ${path}`,
    )
  })

  it('when the parse is cancelled, fails', async () => {
    mkdirSync(`${fixturesDirectory}/parse-file`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/parse-file/crow.ts`, 'class Crow {}\n')
    const applicationData = mockApplicationData()
    const parser = await applicationData.parsers().parserFor({
      language: 'typescript',
      packageName: 'tree-sitter-typescript',
      file: 'tree-sitter-typescript.wasm',
      extensions: ['.ts'],
      interpreters: [],
    })
    spyOn(parser, 'parse').mockReturnValue(null)
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = `${fixturesDirectory}/parse-file/crow.ts`

    const file = parseFile({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Parse file: parse cancelled: ${path}`,
    )
  })
})
