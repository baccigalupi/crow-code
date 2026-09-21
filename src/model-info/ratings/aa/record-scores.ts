import type { AABenchmarks, ModelInfo } from '../../types.ts'

export const benchmarkIntelligence = (
  benchmark: AABenchmarks | undefined,
) => {
  if (benchmark === undefined) {
    return null
  }

  return benchmark.intelligence
}

export const benchmarkAgentic = (
  benchmark: AABenchmarks | undefined,
) => {
  if (benchmark === undefined) {
    return null
  }

  return benchmark.agentic
}

export const benchmarkCoding = (
  benchmark: AABenchmarks | undefined,
) => {
  if (benchmark !== undefined && benchmark.coding > 0) {
    return benchmark.coding
  }

  return null
}

const resolveReasoning = (
  record: ModelInfo,
  benchmark: AABenchmarks | undefined,
) => {
  if (record.reasoning !== null || benchmark === undefined) {
    return record.reasoning
  }

  return benchmark.reasoning
}

const applyToRecord = (
  record: ModelInfo,
  benchmark: AABenchmarks | undefined,
) => {
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
) => {
  return records.map((record) => applyToRecord(record, benchmarks[record.id]))
}
