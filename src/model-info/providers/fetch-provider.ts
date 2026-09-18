export const fetchProvider = async <ApiRecord, T>(
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
  fetchClient: typeof fetch = fetch,
): Promise<T[]> => {
  try {
    const response = await fetchClient(url, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!response.ok) {
      console.error(
        `Catalog request failed with status ${response.status}: ${url}`,
      )
      return []
    }
    return parse((await response.json()) as ApiRecord)
  } catch {
    console.error(`Catalog request failed: ${url}`)
    return []
  }
}
