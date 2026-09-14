import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { CacheFile, ModelRecord } from './types.js'

export const defaultCachePath = (crowDirectory: string): string => {
  return join(crowDirectory, '.crow', 'models.json')
}

export const writeCache = (path: string, models: ModelRecord[]): void => {
  mkdirSync(dirname(path), { recursive: true })
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
  writeFileSync(path, JSON.stringify(cache, null, 2))
}
