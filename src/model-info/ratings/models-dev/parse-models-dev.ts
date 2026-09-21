import type {
  ModelsDevCatalog,
  ModelsDevEntry,
  ReasoningControl,
} from '../../types.ts'

const controlTypes: ReasoningControl[] = [
  'toggle',
  'effort',
  'budget_tokens',
]

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const toControl = (option: unknown): ReasoningControl | null => {
  if (!isObject(option) || typeof option.type !== 'string') {
    return null
  }
  const type = option.type as ReasoningControl
  if (controlTypes.includes(type)) {
    return type
  }
  return null
}

const parseControls = (model: Record<string, unknown>) => {
  if (!Array.isArray(model.reasoning_options)) {
    return []
  }
  const controls = model.reasoning_options
    .map(toControl)
    .filter((control) => control !== null)
  return [...new Set(controls)]
}

const parseEntry = (model: unknown): ModelsDevEntry => {
  if (!isObject(model)) {
    return { reasoning: null, reasoningControls: [] }
  }
  let reasoning: boolean | null = null
  if (typeof model.reasoning === 'boolean') {
    reasoning = model.reasoning
  }
  return { reasoning, reasoningControls: parseControls(model) }
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
