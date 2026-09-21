const servingSuffixes = [':batch', ':free', ':US']

const servingAliases: Record<string, string> = {
  'openai/gpt-6-astra-flex': 'openai/gpt-6-astra',
  'openai/gpt-6-astra-pro-fast': 'openai/gpt-6-astra-pro',
  'openai/gpt-6-astra-pro-flex': 'openai/gpt-6-astra-pro',
  'laguna-xs-2.1:latest': 'poolside/laguna-xs-2.1',
  'gemma4:26b': 'google/gemma-4-26b-a4b-it',
}

const stripTilde = (id: string) => {
  if (id.endsWith('~')) {
    return id.slice(0, -1)
  }
  return id
}

export const normalizeServingId = (id: string) => {
  const normalized = stripTilde(id)
  const suffix = servingSuffixes.find((ending) => normalized.endsWith(ending))
  if (suffix === undefined) {
    return normalized
  }
  return normalized.slice(0, -suffix.length)
}

export const aliasFor = (id: string): string | undefined => {
  return servingAliases[id]
}

export const resolveServingId = (id: string) => {
  const normalized = normalizeServingId(id)
  const alias = aliasFor(normalized)
  if (alias === undefined) {
    return normalized
  }
  return alias
}
