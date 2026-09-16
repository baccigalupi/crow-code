import { readCache } from '../cache.ts'
import type { ModelRecord } from '../types.ts'

const defaultCheapCostThreshold = 0.001

class CheapSummarizerFilter {
  private cheapCostThreshold: number

  constructor(cheapCostThreshold: number = defaultCheapCostThreshold) {
    this.cheapCostThreshold = cheapCostThreshold
  }

  select(models: ModelRecord[]) {
    return models.filter((model) => this.isCheapSummarizer(model))
  }

  private isCheapSummarizer(model: ModelRecord) {
    if (this.isNoReasoning(model) && this.isFreeOrCheap(model)) {
      return true
    }
    return false
  }

  private isNoReasoning(model: ModelRecord) {
    if (model.reasoning !== null && model.reasoning !== 0) {
      return false
    }
    if (model.reasoningMode === '-' || model.reasoningMode === 'off') {
      return true
    }
    return model.reasoningMode.startsWith('off/')
  }

  private isFreeOrCheap(model: ModelRecord) {
    if (model.costInput === 0 && model.costOutput === 0) {
      return true
    }
    if (
      model.costInput >= this.cheapCostThreshold ||
      model.costOutput >= this.cheapCostThreshold
    ) {
      return false
    }
    return true
  }
}

export const selectCheapNoReasoningModels = (
  models: ModelRecord[],
): ModelRecord[] => {
  const filter = new CheapSummarizerFilter()
  return filter.select(models)
}

export const getCheapNoReasoningModels = (cachePath: string): ModelRecord[] => {
  const cache = readCache(cachePath)
  return selectCheapNoReasoningModels(cache.models)
}
