import { aiderPolyglotPct } from './ratings/aider-polyglot.js'
import {
  benchmarkAgentic,
  benchmarkIntelligence,
  resolveCoding,
} from './record-helpers.js'
import { AABenchmarks, ModelRecord } from './types.js'

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

const applyScores = (
  record: ModelRecord,
  benchmark: AABenchmarks | undefined,
): ModelRecord => {
  const coding = resolveCoding(benchmark, aiderPolyglotPct[record.id])
  return {
    ...record,
    reasoning: benchmarkIntelligence(benchmark),
    coding: coding.coding,
    codingSource: coding.source,
    agentic: benchmarkAgentic(benchmark),
  }
}

export const buildRecords = (
  nousRecords: ModelRecord[],
  ollamaRecords: ModelRecord[],
  benchmarks: Record<string, AABenchmarks>,
): ModelRecord[] => {
  const records: ModelRecord[] = []
  nousRecords.forEach((record) => {
    if (shouldSkip(record.id)) {
      return
    }
    records.push(applyScores(record, benchmarks[record.id]))
  })
  ollamaRecords.forEach((record) => {
    records.push(applyScores(record, undefined))
  })
  return records
}
