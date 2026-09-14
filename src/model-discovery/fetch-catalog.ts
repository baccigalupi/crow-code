export const fetchCatalog = async <T>(
  url: string,
  parse: (raw: unknown) => T[],
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
    return parse(await response.json())
  } catch {
    console.error(`Catalog request failed: ${url}`)
    return []
  }
}
