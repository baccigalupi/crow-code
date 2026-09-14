import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AABenchmarks } from './types.js'
import { AAModel, matchAABenchmarks } from './aa-scores.js'

const aaUrl = 'https://artificialanalysis.ai/api/v2/language/models/free'

const aaKeyMissingMessage =
  'AA_API_KEY is not set. Put it in .env (AA_API_KEY=...) or export it, or get a free key at https://artificialanalysis.ai/api-key-management-redirect'

interface AAPage {
  data: AAModel[]
  pagination: { has_more: boolean }
}

const loadApiKeyFromFile = (envPath: string): string | null => {
  const keyLine = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((line) => line.startsWith('AA_API_KEY='))
  if (keyLine === undefined) {
    return null
  }
  return keyLine.slice('AA_API_KEY='.length).trim()
}

const loadApiKey = (): string | null => {
  if (process.env.AA_API_KEY !== undefined) {
    return process.env.AA_API_KEY
  }
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    return null
  }
  return loadApiKeyFromFile(envPath)
}

const fetchAAModelsPage = async (
  key: string,
  page: number,
): Promise<AAPage | null> => {
  try {
    const response = await fetch(`${aaUrl}?page=${page}`, {
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

const collectAllAAModels = async (key: string): Promise<AAModel[]> => {
  const allModels: AAModel[] = []
  let page = 1
  while (true) {
    const pageResult = await fetchAAModelsPage(key, page)
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
): Promise<Record<string, AABenchmarks>> => {
  const key = loadApiKey()
  if (key === null) {
    console.error(aaKeyMissingMessage)
    return {}
  }
  const models = await collectAllAAModels(key)
  return matchAABenchmarks(models, catalogIds)
}
