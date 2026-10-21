import { readFileSync } from 'node:fs'
import { plugin } from 'bun'
import { afterAll } from 'bun:test'
import { flush } from './flush.ts'
import { shouldInstrument } from './include.ts'
import { instrument } from './instrument.ts'
import { clearRaw } from './raw-store.ts'

const root = process.cwd()

const loaderFor = (path: string) => {
  if (path.endsWith('.tsx')) {
    return 'tsx'
  }

  return 'ts'
}

const transform = (source: string, path: string) => {
  if (shouldInstrument(path, root)) {
    return instrument(source, path).code
  }

  return source
}

const load = ({ path }: { path: string }) => {
  const source = readFileSync(path, 'utf8')

  return { contents: transform(source, path), loader: loaderFor(path) }
}

const coverageDir = `${root}/coverage`

const coverageData = () => {
  return (globalThis as unknown as { __coverage__: object }).__coverage__
}

const flushCoverage = () => {
  const coverage = coverageData()

  if (coverage) {
    flush(coverageDir, `${process.pid}`, coverage)
  }
}

if (process.env.BUN_TEST_WORKER_ID === undefined) {
  clearRaw(`${coverageDir}/raw`)
}

plugin({
  name: 'crow-coverage',
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, load)
  },
})

afterAll(flushCoverage)
