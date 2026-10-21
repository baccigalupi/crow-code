import { writeFileSync } from 'node:fs'
import { mergeCoverage } from './merge.ts'
import { readAllRaw, writeRaw } from './raw-store.ts'
import { lcov } from './report.ts'

export const flush = (dir: string, id: string, coverage: object) => {
  writeRaw(`${dir}/raw`, id, coverage)

  const merged = mergeCoverage(readAllRaw(`${dir}/raw`))
  writeFileSync(`${dir}/lcov.info`, lcov(merged))
}
