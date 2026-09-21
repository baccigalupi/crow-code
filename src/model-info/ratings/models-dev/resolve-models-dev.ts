import type { ModelsDevCatalog, ModelsDevEntry } from '../../types.ts'
import { aliasFor, normalizeServingId } from './identity.ts'

const embeddingEntry = (): ModelsDevEntry => ({
  reasoning: false,
  reasoningControls: [],
})

const providerEntry = (
  catalog: ModelsDevCatalog,
  provider: string,
  id: string,
) => {
  const models = catalog[provider]
  if (models === undefined) {
    return undefined
  }
  return models[id]
}

const canonicalEntry = (catalog: ModelsDevCatalog, id: string) => {
  if (!id.includes('/')) {
    return undefined
  }
  const provider = Object.keys(catalog)
    .sort()
    .find((name) => providerEntry(catalog, name, id) !== undefined)
  if (provider === undefined) {
    return undefined
  }
  return providerEntry(catalog, provider, id)
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
  const normalized = normalizeServingId(id)
  const aliased = aliasFor(normalized)
  if (aliased !== undefined) {
    return lookup(catalog, provider, aliased)
  }
  return lookup(catalog, provider, normalized)
}
