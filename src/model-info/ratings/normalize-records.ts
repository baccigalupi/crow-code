import { applyScores } from './aa/record-scores.ts'
import { fetchAABenchmarks } from './aa/benchmarks.ts'
import { fetchModelsDev } from './models-dev/fetch-models-dev.ts'
import { enrichRecords } from './enrich-records.ts'
import type { Environment } from '../../env-vars.ts'
import type { Logger, ModelInfo } from '../types.ts'

export const normalizeRecords = async (
  records: ModelInfo[],
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<ModelInfo[]> => {
  const [modelsDevCatalog, benchmarks] = await Promise.all([
    fetchModelsDev(logger, fetchClient),
    fetchAABenchmarks(
      new Set(records.map((record) => record.id)),
      environment,
      logger,
      fetchClient,
    ),
  ])

  return applyScores(enrichRecords(records, modelsDevCatalog), benchmarks)
}
