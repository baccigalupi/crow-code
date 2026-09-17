import type { AABenchmarks, CodingSource, ModelRecord } from '../types.ts'
import { aiderPolyglotPct } from './aider-polyglot.ts'

type CodingResult = {
  coding: number | null
  source: CodingSource | null
}

export const benchmarkIntelligence = (
  benchmark: AABenchmarks | undefined,
): number | null => {
  if (benchmark === undefined) {
    return null
  }
  return benchmark.intelligence
}

export const benchmarkAgentic = (
  benchmark: AABenchmarks | undefined,
): number | null => {
  if (benchmark === undefined) {
    return null
  }
  return benchmark.agentic
}

export const resolveCoding = (
  benchmark: AABenchmarks | undefined,
  aiderScore: number | undefined,
): CodingResult => {
  if (benchmark !== undefined && benchmark.coding > 0) {
    return { coding: benchmark.coding, source: 'AA' }
  }
  if (aiderScore !== undefined) {
    return { coding: aiderScore, source: 'Aider' }
  }
  return { coding: null, source: null }
}

const applyToRecord = (
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

export const applyScores = (
  records: ModelRecord[],
  benchmarks: Record<string, AABenchmarks>,
): ModelRecord[] => {
  return records.map((record) => applyToRecord(record, benchmarks[record.id]))
}
