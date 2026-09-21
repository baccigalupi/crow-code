import type { ModelInfo, ModelsDevCatalog, ModelsDevEntry } from '../types.ts'
import { resolveModelsDevEntry } from './models-dev/resolve-models-dev.ts'

const enrichedReasoning = (record: ModelInfo, entry: ModelsDevEntry) => {
  if (entry.reasoning !== null) {
    return entry.reasoning
  }
  return record.reasoning
}

const enrichedOptions = (record: ModelInfo, entry: ModelsDevEntry) => {
  if (entry.reasoningOptions.length > 0) {
    return entry.reasoningOptions
  }
  return record.reasoningOptions
}

const enrichment = (record: ModelInfo, entry: ModelsDevEntry) => ({
  reasoning: enrichedReasoning(record, entry),
  reasoningOptions: enrichedOptions(record, entry),
})

const enrichRecord = (
  record: ModelInfo,
  entry: ModelsDevEntry | undefined,
): ModelInfo => {
  if (entry === undefined) {
    return record
  }
  return { ...record, ...enrichment(record, entry) }
}

export const enrichRecords = (
  records: ModelInfo[],
  catalog: ModelsDevCatalog,
): ModelInfo[] => {
  return records.map((record) =>
    enrichRecord(
      record,
      resolveModelsDevEntry(
        catalog,
        record.provider,
        record.id,
        record.modality,
      ),
    )
  )
}
