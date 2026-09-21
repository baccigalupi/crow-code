import type {
  ModelsDevCatalog,
  ModelsDevEntry,
  ReasoningOption,
} from '../../types.ts'

const optionTypes: ReasoningOption[] = [
  'toggle',
  'effort',
  'budget_tokens',
]

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toReasoningOption = (option: unknown): ReasoningOption | null => {
  if (!isObject(option) || typeof option.type !== 'string') {
    return null
  }
  const type = option.type as ReasoningOption
  if (optionTypes.includes(type)) {
    return type
  }
  return null
}

const parseReasoningOptions = (model: Record<string, unknown>) => {
  if (!Array.isArray(model.reasoning_options)) {
    return []
  }
  const options = model.reasoning_options
    .map(toReasoningOption)
    .filter((option) => option !== null)
  return [...new Set(options)]
}

const parseEntry = (model: unknown): ModelsDevEntry => {
  if (!isObject(model)) {
    return { reasoning: null, reasoningOptions: [] }
  }
  let reasoning: boolean | null = null
  if (typeof model.reasoning === 'boolean') {
    reasoning = model.reasoning
  }
  return { reasoning, reasoningOptions: parseReasoningOptions(model) }
}

const parseProvider = (
  catalog: ModelsDevCatalog,
  provider: string,
  value: unknown,
) => {
  if (!isObject(value) || !isObject(value.models)) {
    return catalog
  }
  Object.entries(value.models).forEach(([id, model]) => {
    if (catalog[provider] === undefined) {
      catalog[provider] = {}
    }
    catalog[provider][id] = parseEntry(model)
  })
  return catalog
}

export const parseModelsDevCatalog = (raw: unknown): ModelsDevCatalog => {
  if (!isObject(raw)) {
    return {}
  }
  return Object.entries(raw).reduce(
    (catalog, [provider, value]) => parseProvider(catalog, provider, value),
    {} as ModelsDevCatalog,
  )
}
