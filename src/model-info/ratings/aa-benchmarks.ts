import type { AABenchmarks, AAModel } from '../types.ts'
import type { Environment } from '../../env-vars.ts'
import { matchAABenchmarks } from './aa-scores.ts'

const aaUrl = 'https://artificialanalysis.ai/api/v2/language/models/free'

const aaKeyMissingMessage =
  'AA_API_KEY is not set. Put it in .env (AA_API_KEY=...) or export it, or get a free key at https://artificialanalysis.ai/api-key-management-redirect'

type AAPage = {
  data: AAModel[]
  pagination: { has_more: boolean }
}

const fetchAAModelsPage = async (
  key: string,
  page: number,
  fetchClient: typeof fetch = fetch,
): Promise<AAPage | null> => {
  try {
    const response = await fetchClient(`${aaUrl}?page=${page}`, {
      headers: { 'x-api-key': key },
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) {
      console.error(`Artificial Analysis API returned ${response.status}`)
      return null
    }
    return (await response.json()) as AAPage
  } catch {
    console.error(`Artificial Analysis API unreachable at ${aaUrl}`)
    return null
  }
}

const collectAllAAModels = async (
  key: string,
  fetchClient: typeof fetch = fetch,
): Promise<AAModel[]> => {
  const allModels: AAModel[] = []
  let page = 1
  while (true) {
    const pageResult = await fetchAAModelsPage(key, page, fetchClient)
    if (pageResult === null) {
      return allModels
    }
    allModels.push(...pageResult.data)
    if (!pageResult.pagination.has_more) {
      break
    }
    page++
  }
  return allModels
}

export const fetchAABenchmarks = async (
  catalogIds: Set<string>,
  environment: Environment,
  fetchClient: typeof fetch = fetch,
): Promise<Record<string, AABenchmarks>> => {
  if (!environment.hasValue('AA_API_KEY')) {
    console.error(aaKeyMissingMessage)
    return {}
  }

  const models = await collectAllAAModels(
    environment.value('AA_API_KEY'),
    fetchClient,
  )
  return matchAABenchmarks(models, catalogIds)
}
