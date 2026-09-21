import { applyScores } from './aa/record-scores.ts'
import { fetchAABenchmarks } from './aa/benchmarks.ts'
import { fetchModelsDev } from './models-dev/fetch-models-dev.ts'
import { enrichRecords } from './enrich-records.ts'
import type { Environment } from '../../env-vars.ts'
import type { Logger, ModelInfo } from '../types.ts'

const fetchBenchmarks = (
  records: ModelInfo[],
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  const catalogIds = new Set(records.map((record) => record.id))
  return fetchAABenchmarks(catalogIds, environment, logger, fetchClient)
}

const fetchRatings = (
  records: ModelInfo[],
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  return Promise.all([
    fetchModelsDev(logger, fetchClient),
    fetchBenchmarks(records, environment, logger, fetchClient),
  ])
}

export const normalizeRecords = async (
  records: ModelInfo[],
  environment: Environment,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<ModelInfo[]> => {
  const [modelsDevCatalog, benchmarks] = await fetchRatings(
    records,
    environment,
    logger,
    fetchClient,
  )
  return applyScores(enrichRecords(records, modelsDevCatalog), benchmarks)
}
