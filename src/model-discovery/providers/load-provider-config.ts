import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ProviderConfig } from '../types.js'

type ProviderConfigFile = {
  providers: ProviderConfig[]
}

const providerConfigPath = (crowDirectory: string): string =>
  join(crowDirectory, '.crow', 'providers.json')

export const loadProviderConfig = (
  crowDirectory: string = process.cwd(),
): ProviderConfig[] => {
  const raw = readFileSync(providerConfigPath(crowDirectory), 'utf8')
  const parsed: ProviderConfigFile = JSON.parse(raw)
  return parsed.providers
}
