import { applyScores } from './record-scores.js'
import { fetchAABenchmarks } from './aa-benchmarks.js'
import type { ModelRecord } from '../types.js'

export const appendRatings = async (
  records: ModelRecord[],
): Promise<ModelRecord[]> => {
  const catalogIds = new Set(records.map((record) => record.id))
  const benchmarks = await fetchAABenchmarks(catalogIds)

  return applyScores(records, benchmarks)
}
