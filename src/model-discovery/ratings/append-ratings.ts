import { applyScores } from './record-scores.ts'
import { fetchAABenchmarks } from './aa-benchmarks.ts'
import { Environment } from '../../env-vars.ts'
import type { ModelRecord } from '../types.ts'

export const appendRatings = async (
  records: ModelRecord[],
  environment: Environment,
  fetchClient: typeof fetch = fetch,
): Promise<ModelRecord[]> => {
  const catalogIds = new Set(records.map((record) => record.id))
  const benchmarks = await fetchAABenchmarks(
    catalogIds,
    environment,
    fetchClient,
  )

  return applyScores(records, benchmarks)
}
