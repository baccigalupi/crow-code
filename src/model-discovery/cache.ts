import { dirname, join } from '@std/path'
import type { CacheFile, ModelInfo } from './types.ts'

export const defaultCachePath = (crowDirectory: string): string => {
  return join(crowDirectory, 'models.json')
}

export const writeCache = (path: string, models: ModelInfo[]): void => {
  Deno.mkdirSync(dirname(path), { recursive: true })
  const cache: CacheFile = {
    fetchedAt: new Date().toISOString(),
    modelCount: models.length,
    models,
  }
  Deno.writeTextFileSync(path, JSON.stringify(cache, null, 2))
}

export const readCache = (path: string): CacheFile => {
  const raw = Deno.readTextFileSync(path)
  return JSON.parse(raw)
}
