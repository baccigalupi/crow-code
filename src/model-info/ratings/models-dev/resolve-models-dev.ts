import type { ModelsDevCatalog, ModelsDevEntry } from '../../types.ts'
import { resolveServingId } from './identity.ts'

const embeddingEntry = (): ModelsDevEntry => ({
  reasoning: false,
  reasoningOptions: [],
})

const providerEntry = (
  catalog: ModelsDevCatalog,
  provider: string,
  id: string,
) => {
  if (catalog[provider] === undefined) {
    return undefined
  }
  return catalog[provider][id]
}

const findProvider = (catalog: ModelsDevCatalog, id: string) => {
  return Object.keys(catalog)
    .sort()
    .find((name) => providerEntry(catalog, name, id) !== undefined)
}

const canonicalEntry = (catalog: ModelsDevCatalog, id: string) => {
  if (!id.includes('/')) {
    return undefined
  }
  const provider = findProvider(catalog, id)
  if (provider !== undefined) {
    return providerEntry(catalog, provider, id)
  }
  return undefined
}

const lookup = (catalog: ModelsDevCatalog, provider: string, id: string) => {
  const exact = providerEntry(catalog, provider, id)
  if (exact !== undefined) {
    return exact
  }
  return canonicalEntry(catalog, id)
}

export const resolveModelsDevEntry = (
  catalog: ModelsDevCatalog,
  provider: string,
  id: string,
  modality: string,
) => {
  if (modality.endsWith('->embeddings')) {
    return embeddingEntry()
  }
  return lookup(catalog, provider, resolveServingId(id))
}
