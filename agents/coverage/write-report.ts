import { writeFileSync } from 'node:fs'
import { mergeCoverage } from './merge.ts'
import { readAllRaw } from './raw-store.ts'
import { lcov } from './report.ts'

export const writeReport = (dir: string) => {
  const raw = readAllRaw(`${dir}/raw`)
  if (raw.length === 0) {
    throw new Error(`No coverage data in ${dir}/raw`)
  }

  writeFileSync(`${dir}/lcov.info`, lcov(mergeCoverage(raw)))
}
