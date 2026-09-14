import { AABenchmarks, CodingSource } from './types.js'

export interface CodingResult {
  coding: number | null
  source: CodingSource | null
}

export const nullableNumber = (value: number | undefined): number | null => {
  if (value === undefined) {
    return null
  }
  return value
}

export const nullableString = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null
  }
  return value
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
