import { applyScores } from './record-scores.ts'
import { fetchAABenchmarks } from './aa-benchmarks.ts'
import type { Environment } from '../../env-vars.ts'
import type { ModelInfo } from '../types.ts'
import type pino from 'pino'

export const appendRatings = async (
  records: ModelInfo[],
  environment: Environment,
  logger: pino.Logger,
  fetchClient: typeof fetch = fetch,
): Promise<ModelInfo[]> => {
  const catalogIds = new Set(records.map((record) => record.id))
  const benchmarks = await fetchAABenchmarks(
    catalogIds,
    environment,
    logger,
    fetchClient,
  )

  return applyScores(records, benchmarks)
}
