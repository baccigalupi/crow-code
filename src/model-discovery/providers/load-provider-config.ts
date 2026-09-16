import { join } from 'jsr:@std/path'
import type { ProviderConfig } from '../types.ts'

type ProviderConfigFile = {
  providers: ProviderConfig[]
}

const providerConfigPath = (crowDirectory: string): string =>
  join(crowDirectory, '.crow', 'providers.json')

export const loadProviderConfig = (
  crowDirectory: string = Deno.cwd(),
): ProviderConfig[] => {
  const raw = Deno.readTextFileSync(providerConfigPath(crowDirectory))
  const parsed: ProviderConfigFile = JSON.parse(raw)
  return parsed.providers
}
