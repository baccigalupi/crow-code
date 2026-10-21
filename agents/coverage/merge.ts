import { createCoverageMap } from 'istanbul-lib-coverage'
import type { CoverageMapData } from 'istanbul-lib-coverage'

export const mergeCoverage = (list: CoverageMapData[]) => {
  const map = createCoverageMap({})
  list.forEach((coverage) => map.merge(coverage))

  return map.toJSON()
}
