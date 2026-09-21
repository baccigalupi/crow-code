import type { AABenchmarks, ModelInfo } from '../../types.ts'

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

export const benchmarkCoding = (
  benchmark: AABenchmarks | undefined,
): number | null => {
  if (benchmark !== undefined && benchmark.coding > 0) {
    return benchmark.coding
  }

  return null
}

const resolveReasoning = (
  record: ModelInfo,
  benchmark: AABenchmarks | undefined,
): boolean | null => {
  if (record.reasoning !== null || benchmark === undefined) {
    return record.reasoning
  }

  return benchmark.reasoning
}

const applyToRecord = (
  record: ModelInfo,
  benchmark: AABenchmarks | undefined,
): ModelInfo => {
  return {
    ...record,
    intelligence: benchmarkIntelligence(benchmark),
    coding: benchmarkCoding(benchmark),
    agentic: benchmarkAgentic(benchmark),
    reasoning: resolveReasoning(record, benchmark),
  }
}

export const applyScores = (
  records: ModelInfo[],
  benchmarks: Record<string, AABenchmarks>,
): ModelInfo[] => {
  return records.map((record) => applyToRecord(record, benchmarks[record.id]))
}
