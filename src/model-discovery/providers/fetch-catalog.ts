export const fetchCatalog = async <ApiRecord, T>(
  url: string,
  parse: (raw: ApiRecord) => T[],
  timeoutMs: number,
): Promise<T[]> => {
  try {
    const response = await fetch(url, {
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
