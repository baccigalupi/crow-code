import { applyScores } from './record-scores.ts'
import { fetchAABenchmarks } from './benchmarks.ts'
import type { Environment } from '../../env-vars.ts'
import type { Logger, ModelInfo } from '../types.ts'

export const appendRatings = async (
  records: ModelInfo[],
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  const catalogIds = new Set(records.map((record) => record.id))
  const benchmarks = await fetchAABenchmarks(
    catalogIds,
    environment,
    logger,
    fetchClient,
  )

  return applyScores(records, benchmarks)
}
