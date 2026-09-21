const aaUrl = 'https://artificialanalysis.ai/api/v2/language/models/free'

export const aaModelsRequest = (page: number, key: string) => {
  return new Request(`${aaUrl}?page=${page}`, {
    headers: { 'x-api-key': key },
    signal: AbortSignal.timeout(30000),
  })
}
