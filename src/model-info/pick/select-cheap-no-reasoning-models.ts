import { readModelCatalog } from '../model-catalog.ts'
import type { ModelInfo } from '../types.ts'

const defaultCheapCostThreshold = 0.001

class CheapSummarizerFilter {
  private cheapCostThreshold: number

  constructor(cheapCostThreshold: number = defaultCheapCostThreshold) {
    this.cheapCostThreshold = cheapCostThreshold
  }

  select(models: ModelInfo[]) {
    return models.filter((model) => this.isCheapSummarizer(model))
  }

  private isCheapSummarizer(model: ModelInfo) {
    if (this.isNoReasoning(model) && this.isFreeOrCheap(model)) {
      return true
    }
    return false
  }

  private isNoReasoning(model: ModelInfo) {
    if (model.reasoning !== null && model.reasoning !== 0) {
      return false
    }
    if (model.reasoningMode === '-' || model.reasoningMode === 'off') {
      return true
    }
    return model.reasoningMode.startsWith('off/')
  }

  private isFreeOrCheap(model: ModelInfo) {
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
  models: ModelInfo[],
): ModelInfo[] => {
  const filter = new CheapSummarizerFilter()
  return filter.select(models)
}

export const getCheapNoReasoningModels = (
  modelCatalogPath: string,
): ModelInfo[] => {
  const catalog = readModelCatalog(modelCatalogPath)
  return selectCheapNoReasoningModels(catalog.models)
}
