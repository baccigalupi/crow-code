import { CacheFile, ModelRecord } from './types.js'
import { defaultCachePath } from './cache.js'

export const padRight = (value: string, width: number): string => {
  if (value.length >= width) {
    return value
  }
  return value + ' '.repeat(width - value.length)
}

export const padLeft = (value: string, width: number): string => {
  if (value.length >= width) {
    return value
  }
  return ' '.repeat(width - value.length) + value
}

export const formatScore = (value: number | null): string => {
  if (value === null) {
    return 'n/a'
  }
  return value.toFixed(1)
}

export const formatCost = (costInput: number, costOutput: number): string => {
  if (costInput === 0 && costOutput === 0) {
    return 'free'
  }
  return `$${costInput.toFixed(2)}/${costOutput.toFixed(2)}`
}

export const formatContext = (value: number | null): string => {
  if (value === null) {
    return 'n/a'
  }
  return value.toLocaleString()
}

const codingSourceMark = (model: ModelRecord): string => {
  if (model.codingSource === 'Aider') {
    return '†'
  }
  return ' '
}

const renderLine = (model: ModelRecord): string => {
  const provider = model.providers.join('+')
  return (
    `${padRight(model.id, 45)} ${padLeft(formatScore(model.reasoning), 6)} ` +
    `${padLeft(formatScore(model.coding), 6)}${codingSourceMark(model)} ` +
    `${padLeft(formatScore(model.agentic), 5)} ${padLeft(formatCost(model.costInput, model.costOutput), 16)} ` +
    `${padLeft(formatContext(model.contextLength), 9)}  ${padRight(provider, 4)} ${model.reasoningMode}`
  )
}

export const renderTable = (models: ModelRecord[], cache: CacheFile): void => {
  const header =
    `${padRight('Model', 46)} ${padLeft('Reason', 6)} ${padLeft('Code', 6)} ` +
    `${padLeft('Agent', 5)} ${padLeft('Cost/M(in/out)', 16)} ${padLeft('Ctx', 9)}  Prov  Mode`
  console.log(header)
  console.log('-'.repeat(header.length))
  models.forEach((model) => {
    console.log(renderLine(model))
  })
  console.log(
    `\n${models.length} models (cache: ${defaultCachePath()}, fetched ${cache.fetchedAt}).`,
  )
  console.log(
    'Reason/Code/Agent = Artificial Analysis indices (0-100). † = Aider polyglot fallback for coding.',
  )
  console.log(
    'Cost/M = real per-token price × 1M (in/out). Mode = reasoning mode from the catalog.',
  )
  console.log(
    'Sort: --sort coding|reasoning|agentic|cost|context. Search: --filter, --provider. Raw data: --json.',
  )
}

export const renderJson = (models: ModelRecord[]): void => {
  console.log(JSON.stringify(models, null, 2))
}
