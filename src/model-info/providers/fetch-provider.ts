import type { Logger } from '../types.ts'

export const fetchProvider = async <ApiRecord, T>(
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  try {
    const response = await fetchClient(url, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      logger.error(
        `Catalog request failed with status ${response.status}: ${url}`,
      )
      return []
    }
    return parse((await response.json()) as ApiRecord)
  } catch {
    logger.error(`Catalog request failed: ${url}`)
    return []
  }
}
