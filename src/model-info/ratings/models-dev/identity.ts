const servingSuffixes = [':batch', ':free', ':US']

const servingAliases: Record<string, string> = {
  'openai/gpt-6-astra-flex': 'openai/gpt-6-astra',
  'openai/gpt-6-astra-pro-fast': 'openai/gpt-6-astra-pro',
  'openai/gpt-6-astra-pro-flex': 'openai/gpt-6-astra-pro',
  'laguna-xs-2.1:latest': 'poolside/laguna-xs-2.1',
  'gemma4:26b': 'google/gemma-4-26b-a4b-it',
}

export const normalizeServingId = (id: string) => {
  let normalized = id
  if (normalized.endsWith('~')) {
    normalized = normalized.slice(0, -1)
  }
  const suffix = servingSuffixes.find((ending) => normalized.endsWith(ending))
  if (suffix === undefined) {
    return normalized
  }
  return normalized.slice(0, -suffix.length)
}

export const aliasFor = (id: string): string | undefined => {
  return servingAliases[id]
}
