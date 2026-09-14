import { ModelRecord, Options } from './types.js'

const matchesFilter = (model: ModelRecord, filter: string): boolean => {
  const needle = filter.toLowerCase()
  if (model.id.toLowerCase().includes(needle)) {
    return true
  }
  return model.name.toLowerCase().includes(needle)
}

export const filterRecords = (
  models: ModelRecord[],
  options: Options,
): ModelRecord[] => {
  let filtered = models
  if (options.filter !== undefined) {
    const filter = options.filter
    filtered = filtered.filter((model) => matchesFilter(model, filter))
  }
  if (options.provider !== undefined) {
    const provider = options.provider
    filtered = filtered.filter((model) => model.providers.includes(provider))
  }
  return filtered
}
