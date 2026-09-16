import { applyScores } from './record-scores.ts'
import { fetchAABenchmarks } from './aa-benchmarks.ts'
import type { ModelRecord } from '../types.ts'

export const appendRatings = async (
  records: ModelRecord[],
): Promise<ModelRecord[]> => {
  const catalogIds = new Set(records.map((record) => record.id))
  const benchmarks = await fetchAABenchmarks(catalogIds)

  return applyScores(records, benchmarks)
}
