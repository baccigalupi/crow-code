import { buildNousRecord } from './nous-record.js'
import { buildOllamaRecord } from './ollama-record.js'
import { AABenchmarks, ModelRecord, NousModel, OllamaModel } from './types.js'

const skipPattern =
  /(embedding|embed|:image|-image|lyria|gpt-audio|relace-search)/

const shouldSkip = (id: string): boolean => {
  if (id.startsWith('~')) {
    return true
  }
  if (id.startsWith('openrouter/')) {
    return true
  }
  return skipPattern.test(id)
}

export const buildRecords = (
  nousModels: NousModel[],
  ollamaModels: OllamaModel[],
  benchmarks: Record<string, AABenchmarks>,
): ModelRecord[] => {
  const records: ModelRecord[] = []
  nousModels.forEach((model) => {
    if (shouldSkip(model.id)) {
      return
    }
    records.push(buildNousRecord(model, benchmarks[model.id]))
  })
  ollamaModels.forEach((model) => {
    records.push(buildOllamaRecord(model))
  })
  return records
}
