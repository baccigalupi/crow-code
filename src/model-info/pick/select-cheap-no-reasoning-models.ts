import { readModelCatalog } from '../catalog/model-catalog.ts'
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
    return this.isNoReasoning(model) && this.isFreeOrCheap(model)
  }

  private isNoReasoning(model: ModelInfo) {
    return model.reasoning === false
  }

  private isFreeOrCheap(model: ModelInfo) {
    return this.isFree(model) || this.isCheap(model)
  }

  private isFree(model: ModelInfo) {
    return model.costInput === 0 && model.costOutput === 0
  }

  private isCheap(model: ModelInfo) {
    return (
      model.costInput < this.cheapCostThreshold &&
      model.costOutput < this.cheapCostThreshold
    )
  }
}

export const selectCheapNoReasoningModels = (models: ModelInfo[]) => {
  const filter = new CheapSummarizerFilter()
  return filter.select(models)
}

export const getCheapNoReasoningModels = (
  modelCatalogPath: string,
  modelCount: number = Infinity,
) => {
  const catalog = readModelCatalog(modelCatalogPath)
  return selectCheapNoReasoningModels(catalog.models).slice(0, modelCount)
}
