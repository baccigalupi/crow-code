import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { diagnostics } from '../../../src/tools/research/diagnostics.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('diagnostics', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/diagnostics`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/diagnostics`))

  it('when the file parses cleanly, returns no diagnostics', async () => {
    mkdirSync(`${fixturesDirectory}/diagnostics`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/diagnostics/ok.ts`, 'const a = 1\n')
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/diagnostics/ok.ts`

    const file = diagnostics({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({
      path,
      language: 'typescript',
      diagnostics: [],
    })
  })

  it('when a typescript file is broken, returns its syntax errors', async () => {
    mkdirSync(`${fixturesDirectory}/diagnostics`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/diagnostics/broken.ts`,
      'function fly( {\n',
    )
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/diagnostics/broken.ts`

    const file = diagnostics({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result().diagnostics).toEqual([
      {
        line: 1,
        column: 1,
        severity: 'error',
        message: 'syntax error',
        source: 'syntax',
      },
    ])
  })

  it('when a python file is broken, returns its syntax errors', async () => {
    mkdirSync(`${fixturesDirectory}/diagnostics`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/diagnostics/broken.py`, 'def fly(:\n')
    const applicationData = mockApplicationData()
    const path = `${fixturesDirectory}/diagnostics/broken.py`

    const file = diagnostics({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.result()).toEqual({
      path,
      language: 'python',
      diagnostics: [
        {
          line: 1,
          column: 9,
          severity: 'error',
          message: 'missing )',
          source: 'syntax',
        },
      ],
    })
  })

  it('when the file has no grammar, fails with the parse reason', async () => {
    mkdirSync(`${fixturesDirectory}/diagnostics`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/diagnostics/notes.md`, '# notes\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = `${fixturesDirectory}/diagnostics/notes.md`

    const file = diagnostics({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[1][0]).toBe(
      `Syntax diagnostics: no grammar for path: ${path}`,
    )
  })

  it('when the path is outside the allowed directories, fails', async () => {
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const path = resolve(process.cwd(), '..', 'outside.ts')

    const file = diagnostics({ applicationData, operationArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Syntax diagnostics: path not allowed: ${path}`,
    )
  })
})
