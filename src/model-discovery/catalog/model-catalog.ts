import { dirname, join } from '@std/path'
import type { ModelCatalog, ModelInfo } from '../types.ts'

export const defaultModelCatalogPath = (crowDirectory: string) => {
  return join(crowDirectory, 'models.json')
}

export const writeModelCatalog = (path: string, models: ModelInfo[]) => {
  Deno.mkdirSync(dirname(path), { recursive: true })
  const catalog: ModelCatalog = {
    fetchedAt: new Date().toISOString(),
    modelCount: models.length,
    models,
  }
  Deno.writeTextFileSync(path, JSON.stringify(catalog, null, 2))
}

export const readModelCatalog = (path: string): ModelCatalog => {
  const raw = Deno.readTextFileSync(path)
  return JSON.parse(raw)
}
