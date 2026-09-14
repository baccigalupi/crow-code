import { ModelRecord, SortKey } from './types.js'

const sortValue = (model: ModelRecord, sort: SortKey): number | null => {
  if (sort === 'coding') {
    return model.coding
  }
  if (sort === 'reasoning') {
    return model.reasoning
  }
  if (sort === 'agentic') {
    return model.agentic
  }
  if (sort === 'cost') {
    return model.costInput + model.costOutput
  }
  return model.contextLength
}

const compareModels = (
  left: ModelRecord,
  right: ModelRecord,
  sort: SortKey,
): number => {
  const ascending = sort === 'cost'
  const leftValue = sortValue(left, sort)
  const rightValue = sortValue(right, sort)
  if (leftValue === null && rightValue === null) {
    return left.id.localeCompare(right.id)
  }
  if (leftValue === null) {
    return 1
  }
  if (rightValue === null) {
    return -1
  }
  if (ascending) {
    return leftValue - rightValue
  }
  return rightValue - leftValue
}

export const sortRecords = (
  models: ModelRecord[],
  sort: SortKey,
): ModelRecord[] => {
  const sorted = [...models]
  sorted.sort((left, right) => compareModels(left, right, sort))
  return sorted
}
