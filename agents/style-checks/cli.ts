// Style-check gate: audit TypeScript style and test conventions.
// Usage: agents/style-check [--changed] [--all] [FILE ...]
//
//   (no args)   audit every tracked and untracked src/ and tests/ file
//   --changed   audit changed, staged, and untracked files
//   --all       audit everything (same as no args)
//   FILE ...    audit the named files; each file's path decides which
//               checks apply. Files outside src/ and tests/ get advisory
//               lint that reports but never fails the run.

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
const checksDir = 'agents/style-checks'

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

const gitFiles = async (args: string[]): Promise<string[]> => {
  const output = await new Deno.Command('git', { args }).output()
  return new TextDecoder()
    .decode(output.stdout)
    .split('\n')
    .filter((line) => line.length > 0)
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

const existingFiles = async (files: string[]): Promise<string[] | null> => {
  for (const file of files) {
    const stat = await Deno.stat(file).catch(() => null)
    if (stat === null || !stat.isFile) {
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

const runDeno = async (args: string[]): Promise<number> => {
  const output = await new Deno.Command('deno', {
    args,
    stdout: 'piped',
    stderr: 'piped',
  }).output()
  await Deno.stdout.write(output.stdout)
  await Deno.stderr.write(output.stderr)
  return output.code
}

const lintConfig = async (config: string, files: string[]) =>
  await runDeno(['lint', '--config', `${checksDir}/${config}`, ...files])

const checkCode = async (files: string[]): Promise<boolean> => {
  let ok = (await lintConfig('code.deno.json', files)) === 0
  const tsxFiles = files.filter((file) => file.endsWith('.tsx'))
  if (tsxFiles.length > 0) {
    ok = (await lintConfig('tsx.deno.json', tsxFiles)) === 0 && ok
  }
  const guard = await runDeno([
    'run',
    '--allow-run',
    '--allow-read',
    '--allow-env',
    `${checksDir}/void-guard-calls.ts`,
    ...files,
  ])
  return guard === 0 && ok
}

const exists = async (file: string): Promise<boolean> =>
  (await Deno.stat(file).catch(() => null))?.isFile === true

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
  const linted = (await lintConfig('unit-tests.deno.json', [testFile])) === 0
  return mirrored && linted
}

const advise = async (file: string): Promise<void> => {
  if (!/\.tsx?$/.test(file)) {
    console.log(`${file}: no style checks apply`)
    return
  }
  await runDeno(['lint', file])
}

const checkSupport = async (files: string[]): Promise<boolean> => {
  let ok = (await lintConfig('code.deno.json', files)) === 0
  const tsxFiles = files.filter((file) => file.endsWith('.tsx'))
  if (tsxFiles.length > 0) {
    ok = (await lintConfig('tsx.deno.json', tsxFiles)) === 0 && ok
  }
  return ok
}

const checkFiles = async (files: string[]): Promise<boolean> => {
  const code = files.filter((file) => classify(file) === 'code')
  const tests = files.filter((file) => classify(file) === 'test')
  const support = files.filter((file) => classify(file) === 'support')
  const others = files.filter((file) => classify(file) === 'other')
  let ok = true
  if (code.length > 0) ok = (await checkCode(code)) && ok
  for (const test of tests) ok = (await checkTest(test)) && ok
  if (support.length > 0) ok = (await checkSupport(support)) && ok
  for (const other of others) await advise(other)
  return ok
}

const main = async () => {
  const parsed = parseArgs(Deno.args)
  if (!parsed.ok) {
    console.error(usage)
    Deno.exit(1)
  }
  const files = await resolveFiles(parsed.scope, parsed.files)
  if (files === null) Deno.exit(1)
  if (files.length === 0) console.log('No violations')
  Deno.exit((await checkFiles(files)) ? 0 : 1)
}

if (import.meta.main) await main()
