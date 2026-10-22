import { createCoverageMap } from 'istanbul-lib-coverage'
import { createContext } from 'istanbul-lib-report'
import { create } from 'istanbul-reports'
import { mergeCoverage } from './merge.ts'
import { readAllRaw } from './raw-store.ts'

export const writeHtml = (dir: string) => {
  const coverageMap = createCoverageMap(mergeCoverage(readAllRaw(`${dir}/raw`)))
  const context = createContext({ dir: `${dir}/html`, coverageMap })

  create('html').execute(context)
}
