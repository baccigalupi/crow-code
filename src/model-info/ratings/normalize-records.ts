import { fetchModelsDev } from './models-dev/fetch-models-dev.ts'
import { enrichRecords } from './enrich-records.ts'
import type { Logger, ModelInfo } from '../types.ts'

export const normalizeRecords = async (
  records: ModelInfo[],
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<ModelInfo[]> => {
  const modelsDevCatalog = await fetchModelsDev(logger, fetchClient)
  return enrichRecords(records, modelsDevCatalog)
}
