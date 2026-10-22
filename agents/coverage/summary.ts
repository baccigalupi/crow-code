import { createCoverageMap } from 'istanbul-lib-coverage'
import type { CoverageMapData } from 'istanbul-lib-coverage'

export const summary = (coverage: CoverageMapData) => {
  const map = createCoverageMap(coverage)

  return map
    .files()
    .map((path) => {
      const { lines, branches, functions } = map.fileCoverageFor(path).toSummary()

      return `${path}  lines ${lines.pct}%  branches ${branches.pct}%  functions ${functions.pct}%\n`
    })
    .join('')
}
