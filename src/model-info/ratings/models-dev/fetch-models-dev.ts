import { ApiRequest } from '../../api-request.ts'
import type { Logger } from '../../types.ts'
import { parseCatalog } from './parse-models-dev.ts'

const modelsDevUrl = 'https://models.dev/api.json'

export const fetchModelsDev = (
  logger: Logger,
  fetchClient: typeof fetch = fetch,
  timeoutMs = 30000,
) => {
  const request = new Request(modelsDevUrl, {
    signal: AbortSignal.timeout(timeoutMs),
  })
  return new ApiRequest(request, fetchClient, parseCatalog, logger).perform()
}
