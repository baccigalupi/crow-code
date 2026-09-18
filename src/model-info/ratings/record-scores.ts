import type { AABenchmarks, CodingSource, ModelInfo } from '../types.ts'

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
): CodingResult => {
  if (benchmark !== undefined && benchmark.coding > 0) {
    return { coding: benchmark.coding, source: 'AA' }
  }

  return { coding: null, source: null }
}

const applyToRecord = (
  record: ModelInfo,
  benchmark: AABenchmarks | undefined,
): ModelInfo => {
  const coding = resolveCoding(benchmark)

  return {
    ...record,
    reasoning: benchmarkIntelligence(benchmark),
    coding: coding.coding,
    codingSource: coding.source,
    agentic: benchmarkAgentic(benchmark),
  }
}

export const applyScores = (
  records: ModelInfo[],
  benchmarks: Record<string, AABenchmarks>,
): ModelInfo[] => {
  return records.map((record) => applyToRecord(record, benchmarks[record.id]))
}
