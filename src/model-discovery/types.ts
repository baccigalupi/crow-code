export type SortKey = 'coding' | 'reasoning' | 'agentic' | 'cost' | 'context'

export type CodingSource = 'AA' | 'Aider'

export interface ModelRecord {
  id: string
  name: string
  providers: string[]
  reasoning: number | null
  coding: number | null
  codingSource: CodingSource | null
  agentic: number | null
  costInput: number
  costOutput: number
  contextLength: number | null
  modality: string
  reasoningMode: string
  knowledgeCutoff: string | null
  size: string
}

export interface CacheFile {
  fetchedAt: string
  sources: string[]
  models: ModelRecord[]
}

export interface ReasoningMeta {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
}

export interface NousModel {
  id: string
  name?: string
  context_length?: number
  knowledge_cutoff?: string
  pricing?: { prompt?: string; completion?: string }
  reasoning?: ReasoningMeta | null
  architecture?: { modality?: string }
}

export interface OllamaModel {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

export interface AABenchmarks {
  intelligence: number
  coding: number
  agentic: number
}

export interface Options {
  refresh: boolean
  filter?: string
  provider?: string
  sort: SortKey
  top: number
  all: boolean
  json: boolean
}
