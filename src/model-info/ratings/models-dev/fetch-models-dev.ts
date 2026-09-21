import type { Logger, ModelsDevCatalog } from '../../types.ts'
import { parseModelsDevCatalog } from './parse-models-dev.ts'

const modelsDevUrl = 'https://models.dev/api.json'

const emptyCatalog = (): ModelsDevCatalog => ({})

export const fetchModelsDev = async (
  logger: Logger,
  fetchClient: typeof fetch = fetch,
  timeoutMs = 30000,
) => {
  try {
    const response = await fetchClient(modelsDevUrl, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      logger.error(`models.dev API returned ${response.status}`)
      return emptyCatalog()
    }
    return parseModelsDevCatalog(await response.json())
  } catch {
    logger.error(`models.dev API unreachable at ${modelsDevUrl}`)
    return emptyCatalog()
  }
}
