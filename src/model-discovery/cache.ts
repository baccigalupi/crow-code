import { dirname, join } from '@std/path'
import type { CacheFile, ModelRecord } from './types.ts'

export const defaultCachePath = (crowDirectory: string): string => {
  return join(crowDirectory, 'models.json')
}

export const writeCache = (path: string, models: ModelRecord[]): void => {
  Deno.mkdirSync(dirname(path), { recursive: true })
  const cache: CacheFile = {
    fetchedAt: new Date().toISOString(),
    sources: [
      'Nous catalog (pricing, context, modality, reasoning mode)',
      'Ollama local catalog',
      'Artificial Analysis Intelligence/Coding/Agentic indices (free tier)',
      'Aider polyglot leaderboard (coding fallback)',
    ],
    models,
  }
  Deno.writeTextFileSync(path, JSON.stringify(cache, null, 2))
}

export const readCache = (path: string): CacheFile => {
  const raw = Deno.readTextFileSync(path)
  return JSON.parse(raw)
}
