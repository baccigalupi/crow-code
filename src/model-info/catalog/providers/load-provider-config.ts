import { join } from '@std/path'
import type { ProviderConfig } from '../../types.ts'

type ProviderConfigFile = {
  providers: ProviderConfig[]
}

const providerConfigPath = (crowDirectory: string): string =>
  join(crowDirectory, 'providers.json')

export const loadProviderConfig = (
  crowDirectory: string,
): ProviderConfig[] => {
  const raw = Deno.readTextFileSync(providerConfigPath(crowDirectory))
  const parsed: ProviderConfigFile = JSON.parse(raw)
  return parsed.providers
}
