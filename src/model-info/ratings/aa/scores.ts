import type { AABenchmarks, AAModel } from '../../types.ts'
import { candidateIds } from './match.ts'

const toScore = (value: number | null) => {
  if (value === null) {
    return 0
  }
  return value
}

const firstNonNull = (a: boolean | null, b: boolean | null) => {
  if (a !== null) {
    return a
  }
  return b
}

const toReasoning = (model: AAModel): boolean | null => {
  if (model.reasoning_model === undefined) {
    return null
  }
  return model.reasoning_model
}

const mergeScore = (current: number, value: number | null) => {
  return Math.max(current, toScore(value))
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
    intelligence: mergeScore(
      previous.intelligence,
      model.evaluations.artificial_analysis_intelligence_index,
    ),
    coding: mergeScore(
      previous.coding,
      model.evaluations.artificial_analysis_coding_index,
    ),
    agentic: mergeScore(
      previous.agentic,
      model.evaluations.artificial_analysis_agentic_index,
    ),
    reasoning: firstNonNull(previous.reasoning, toReasoning(model)),
  }
}

export const matchAABenchmarks = (
  models: AAModel[],
  catalogIds: Set<string>,
) => {
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
