const creatorPrefix: Record<string, string> = {
  Anthropic: 'anthropic',
  OpenAI: 'openai',
  Google: 'google',
  DeepSeek: 'deepseek',
  Meta: 'meta',
  Kimi: 'moonshotai',
  'Moonshot AI': 'moonshotai',
  'Z AI': 'z-ai',
  Alibaba: 'qwen',
  SpaceXAI: 'x-ai',
  Mistral: 'mistralai',
  NVIDIA: 'nvidia',
  Cohere: 'cohere',
  Amazon: 'amazon',
  MiniMax: 'minimax',
  'ByteDance Seed': 'bytedance-seed',
  Inception: 'inception',
  IBM: 'ibm-granite',
  Tencent: 'tencent',
  'Thinking Machines': 'thinkingmachines',
  Microsoft: 'microsoft',
  StepFun: 'stepfun',
  KwaiKAT: 'kwaipilot',
  'Liquid AI': 'liquid',
  'Nous Research': 'nousresearch',
  Perplexity: 'perplexity',
  'AI21 Labs': 'ai21',
  Baidu: 'baidu',
  'Arcee AI': 'arcee-ai',
  'Reka AI': 'rekaai',
  Xiaomi: 'xiaomi',
  Upstage: 'upstage',
  LongCat: 'meituan',
}

const effortSuffixes = ['-xhigh', '-high', '-medium', '-low', '-flex', '-fast']

const modeSuffixes = [
  '-non-reasoning',
  '-reasoning',
  '-thinking',
  '-minimal',
  '-instruct',
  '-preview',
  '-experimental',
  '-exp',
]

const datePatterns = [/-\d{4}$/, /-\d{2}-\d{2}$/, /-\d{6}$/]

const normalizeSlug = (slug: string): string => {
  let normalized = slug
  normalized = normalized
    .replace(/gpt-35-/g, 'gpt-3-5-')
    .replace(/claude-35-/g, 'claude-3-5-')
  normalized = normalized.replace(/(\d)-(\d)/g, '$1.$2')
  return normalized
}

const stripSuffixes = (value: string, suffixes: string[]): string[] => {
  const stripped: string[] = []
  suffixes.forEach((suffix) => {
    if (value.endsWith(suffix)) {
      stripped.push(value.slice(0, -suffix.length))
    }
  })
  return stripped
}

const stripDatePatterns = (value: string, patterns: RegExp[]): string[] => {
  const stripped: string[] = []
  patterns.forEach((pattern) => {
    const withoutDate = value.replace(pattern, '')
    if (withoutDate !== value) {
      stripped.push(withoutDate)
    }
  })
  return stripped
}

const collectVariants = (base: string): Set<string> => {
  const variants = new Set<string>([base])
  stripSuffixes(base, effortSuffixes).forEach((variant) =>
    variants.add(variant),
  )
  stripSuffixes(base, modeSuffixes).forEach((variant) => variants.add(variant))
  stripDatePatterns(base, datePatterns).forEach((variant) =>
    variants.add(variant),
  )
  return variants
}

const expandEffortVariants = (variants: Set<string>): void => {
  const extra: string[] = []
  variants.forEach((variant) => {
    stripSuffixes(variant, effortSuffixes).forEach((stripped) =>
      extra.push(stripped),
    )
  })
  extra.forEach((variant) => variants.add(variant))
}

export const candidateIds = (slug: string, creator: string): string[] => {
  const prefix = creatorPrefix[creator]
  if (prefix === undefined) {
    return []
  }
  const variants = collectVariants(normalizeSlug(slug))
  expandEffortVariants(variants)
  return [...variants].map((variant) => `${prefix}/${variant}`)
}
