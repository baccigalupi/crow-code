// Style-check gate: audit TypeScript style and test conventions.
// Usage: agents/style-check [--changed] [--all] [FILE ...]
//
//   (no args)   audit every tracked and untracked src/ and tests/ file
//   --changed   audit changed, staged, and untracked files
//   --all       audit everything (same as no args)
//   FILE ...    audit the named files; each file's path decides which
//               checks apply. Files outside src/ and tests/ get advisory
//               lint that reports but never fails the run.

import { readFile, stat } from 'node:fs/promises'
import { codePlugin } from './code-plugin.ts'
import { checkSource } from './engine/check-source.ts'
import type { Plugin } from './engine/types.ts'
import { installNamesPlugin } from './install-names-plugin.ts'
import { tsxPlugin } from './tsx-plugin.ts'
import { unitTestsPlugin } from './unit-tests-plugin.ts'
import { voidGuardViolations } from './void-guard.ts'

export const usage = 'Usage: agents/style-check [--changed] [--all] [FILE ...]'

const codeGlobs = ['src/*.ts', 'src/*.tsx', 'src/**/*.ts', 'src/**/*.tsx']
const testGlobs = [
  'tests/*.test.ts',
  'tests/*.test.tsx',
  'tests/**/*.test.ts',
  'tests/**/*.test.tsx',
]
const supportGlobs = [
  'tests/*.ts',
  'tests/*.tsx',
  'tests/**/*.ts',
  'tests/**/*.tsx',
]

export type Kind = 'code' | 'test' | 'support' | 'other'

export type Parsed =
  | { ok: true; scope: 'all' | 'changed' | 'files'; files: string[] }
  | { ok: false; message: string }

export const classify = (file: string): Kind => {
  if (file.startsWith('src/') && /\.tsx?$/.test(file)) return 'code'
  if (file.startsWith('tests/') && /\.test\.tsx?$/.test(file)) return 'test'
  if (
    file.startsWith('tests/') &&
    !file.includes('/fixtures/') &&
    /\.tsx?$/.test(file)
  )
    return 'support'
  return 'other'
}

const flagScope = (arg: string): 'all' | 'changed' | null => {
  if (arg === '--all') return 'all'
  if (arg === '--changed') return 'changed'
  return null
}

export const parseArgs = (args: string[]): Parsed => {
  const files: string[] = []
  let scope: 'all' | 'changed' | null = null
  let literal = false
  for (const arg of args) {
    if (literal) {
      files.push(arg)
    } else if (arg === '--') {
      literal = true
    } else if (flagScope(arg) !== null) {
      if (scope !== null) return { ok: false, message: usage }
      scope = flagScope(arg)
    } else if (arg.startsWith('-')) {
      return { ok: false, message: usage }
    } else {
      files.push(arg)
    }
  }
  if (files.length > 0 && scope !== null) {
    return { ok: false, message: usage }
  }
  if (files.length > 0) return { ok: true, scope: 'files', files }
  return { ok: true, scope: scope ?? 'all', files }
}

const pluginsFor = (file: string): Plugin[] => {
  const kind = classify(file)
  const tsx = file.endsWith('.tsx') ? [tsxPlugin] : []
  if (kind === 'code') return [codePlugin, installNamesPlugin, ...tsx]
  if (kind === 'test') return [unitTestsPlugin, installNamesPlugin]
  if (kind === 'support') return [codePlugin, ...tsx]
  return []
}

export const lintSource = (file: string, source: string): string[] =>
  pluginsFor(file).flatMap((plugin) =>
    checkSource(plugin, file, source).map(
      ({ rule, message, line, column }) =>
        `${file}:${line}:${column}: ${rule}: ${message}`,
    ),
  )

const gitFiles = async (args: string[]): Promise<string[]> => {
  const child = Bun.spawn(['git', ...args], { stdout: 'pipe' })
  const output = await new Response(child.stdout).text()
  await child.exited
  return output.split('\n').filter((line) => line.length > 0)
}

const trackedFiles = async (): Promise<string[]> => {
  const files = [
    ...new Set([
      ...(await gitFiles([
        'ls-files',
        ...codeGlobs,
        ...testGlobs,
        ...supportGlobs,
      ])),
      ...(await gitFiles([
        'ls-files',
        '--others',
        '--exclude-standard',
        ...codeGlobs,
        ...testGlobs,
        ...supportGlobs,
      ])),
    ]),
  ]
  const deleted = await gitFiles(['ls-files', '--deleted'])
  return files.filter((file) => !deleted.includes(file))
}

const changedFiles = async (): Promise<string[]> => {
  const files = [
    ...(await gitFiles(['diff', '--name-only', '--diff-filter=ACMR'])),
    ...(await gitFiles([
      'diff',
      '--staged',
      '--name-only',
      '--diff-filter=ACMR',
    ])),
    ...(await gitFiles(['ls-files', '--others', '--exclude-standard'])),
  ]
  return [...new Set(files)]
}

const exists = async (file: string): Promise<boolean> =>
  (await stat(file).catch(() => null))?.isFile() === true

const existingFiles = async (files: string[]): Promise<string[] | null> => {
  for (const file of files) {
    if (!(await exists(file))) {
      console.error(`${file}: no such file`)
      return null
    }
  }
  return files
}

const resolveFiles = async (
  scope: 'all' | 'changed' | 'files',
  files: string[],
): Promise<string[] | null> => {
  if (scope === 'all') return await trackedFiles()
  if (scope === 'changed') return await changedFiles()
  return await existingFiles(files)
}

const run = async (command: string[]): Promise<number> =>
  await Bun.spawn(command, { stdout: 'inherit', stderr: 'inherit' }).exited

const lintFile = async (file: string): Promise<boolean> => {
  const lines = lintSource(file, await readFile(file, 'utf8'))
  for (const line of lines) console.log(line)
  return lines.length === 0
}

const voidGuard = (files: string[]) => {
  const lines = voidGuardViolations(files)
  for (const line of lines) console.log(line)
  return lines.length === 0
}

const checkMirror = async (testFile: string): Promise<boolean> => {
  const base = testFile.slice('tests/'.length).replace(/\.test\.tsx?$/, '')
  const candidates = [
    `src/${base}.ts`,
    `src/${base}.tsx`,
    `${base}.ts`,
    `${base}.tsx`,
    base,
    `tests/${base}.ts`,
  ]
  for (const candidate of candidates) {
    if (await exists(candidate)) return true
  }
  console.log(
    `${testFile}:1: test path must mirror source: ` +
      `expected src/${base}.ts or src/${base}.tsx`,
  )
  return false
}

const checkTest = async (testFile: string): Promise<boolean> => {
  const mirrored = await checkMirror(testFile)
  const linted = await lintFile(testFile)
  return mirrored && linted
}

const advise = async (file: string): Promise<void> => {
  if (!/\.tsx?$/.test(file)) {
    console.log(`${file}: no style checks apply`)
    return
  }
  await run(['node_modules/.bin/oxlint', file])
}

const checkFiles = async (files: string[]): Promise<boolean> => {
  const code = files.filter((file) => classify(file) === 'code')
  const tests = files.filter((file) => classify(file) === 'test')
  const support = files.filter((file) => classify(file) === 'support')
  const others = files.filter((file) => classify(file) === 'other')
  let ok = true
  for (const file of [...code, ...support]) ok = (await lintFile(file)) && ok
  if (code.length > 0) ok = voidGuard(code) && ok
  for (const test of tests) ok = (await checkTest(test)) && ok
  for (const other of others) await advise(other)
  return ok
}

const main = async () => {
  const parsed = parseArgs(process.argv.slice(2))
  if (!parsed.ok) {
    console.error(usage)
    process.exit(1)
  }
  const files = await resolveFiles(parsed.scope, parsed.files)
  if (files === null) process.exit(1)
  if (files.length === 0) console.log('No violations')
  process.exit((await checkFiles(files)) ? 0 : 1)
}

if (import.meta.main) await main()
