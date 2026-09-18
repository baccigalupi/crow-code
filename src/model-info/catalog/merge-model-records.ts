import type { ModelInfo } from '../types.ts'

const mergeRecords = (existing: ModelInfo, record: ModelInfo) => {
  return {
    ...existing,
    providers: [...new Set([...existing.providers, ...record.providers])],
  }
}

const addRecord = (records: Map<string, ModelInfo>, record: ModelInfo) => {
  const existing = records.get(record.id)
  if (existing === undefined) {
    records.set(record.id, record)
  } else {
    records.set(record.id, mergeRecords(existing, record))
  }
  return records
}

export const mergeModelRecords = (records: ModelInfo[]) => {
  return Array.from(records.reduce(addRecord, new Map()).values())
}
