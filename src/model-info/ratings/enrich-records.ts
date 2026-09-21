import type { ModelInfo, ModelsDevCatalog, ModelsDevEntry } from '../types.ts'
import { resolveModelsDevEntry } from './models-dev/resolve-models-dev.ts'

const enrichRecord = (
  record: ModelInfo,
  entry: ModelsDevEntry,
): ModelInfo => {
  let reasoning = record.reasoning
  if (entry.reasoning !== null) {
    reasoning = entry.reasoning
  }
  let reasoningControls = record.reasoningControls
  if (entry.reasoningControls.length > 0) {
    reasoningControls = entry.reasoningControls
  }
  return { ...record, reasoning, reasoningControls }
}

export const enrichRecords = (
  records: ModelInfo[],
  catalog: ModelsDevCatalog,
): ModelInfo[] => {
  return records.map((record) => {
    const entry = resolveModelsDevEntry(
      catalog,
      record.provider,
      record.id,
      record.modality,
    )
    if (entry === undefined) {
      return record
    }
    return enrichRecord(record, entry)
  })
}
