import type { AABenchmarks, AAModel } from '../../types.ts'
import { candidateIds } from './match.ts'

const toScore = (value: number | null): number => {
  if (value === null) {
    return 0
  }
  return value
}

const firstNonNull = (
  a: boolean | null,
  b: boolean | null,
): boolean | null => {
  if (a !== null) {
    return a
  }
  return b
}

const benchmarkScoresOrEmpty = (
  scores: AABenchmarks | undefined,
): AABenchmarks => {
  if (scores === undefined) {
    return { intelligence: 0, coding: 0, agentic: 0, reasoning: null }
  }
  return scores
}

const mergeBenchmarkScores = (
  current: AABenchmarks | undefined,
  model: AAModel,
): AABenchmarks => {
  const previous = benchmarkScoresOrEmpty(current)
  return {
    intelligence: Math.max(
      previous.intelligence,
      toScore(model.evaluations.artificial_analysis_intelligence_index),
    ),
    coding: Math.max(
      previous.coding,
      toScore(model.evaluations.artificial_analysis_coding_index),
    ),
    agentic: Math.max(
      previous.agentic,
      toScore(model.evaluations.artificial_analysis_agentic_index),
    ),
    reasoning: firstNonNull(previous.reasoning, model.reasoning_model ?? null),
  }
}

export const matchAABenchmarks = (
  models: AAModel[],
  catalogIds: Set<string>,
): Record<string, AABenchmarks> => {
  const scores: Record<string, AABenchmarks> = {}
  models.forEach((model) => {
    const hit = candidateIds(model.slug, model.model_creator.name).find(
      (candidate) => catalogIds.has(candidate),
    )
    if (hit === undefined) {
      return
    }
    scores[hit] = mergeBenchmarkScores(scores[hit], model)
  })
  return scores
}
