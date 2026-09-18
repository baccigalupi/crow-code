import type pino from 'pino'

export type Logger = pino.Logger

export type CodingSource = 'AA' | 'Aider'

export type ProviderConfig = {
  name: string
  baseUrl: string
  modelsUrl?: string
  apiKeyEnv?: string
}

export type ModelInfo = {
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

export type ModelCatalog = {
  fetchedAt: string
  modelCount: number
  models: ModelInfo[]
}

export type AABenchmarks = {
  intelligence: number
  coding: number
  agentic: number
}

export type AAModel = {
  slug: string
  model_creator: { name: string }
  evaluations: {
    artificial_analysis_intelligence_index: number | null
    artificial_analysis_coding_index: number | null
    artificial_analysis_agentic_index: number | null
  }
}

export type ReasoningMeta = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
}

export type NousModel = {
  id: string
  name?: string
  context_length?: number
  knowledge_cutoff?: string
  pricing?: { prompt?: string; completion?: string }
  reasoning?: ReasoningMeta | null
  architecture?: { modality?: string }
}

export type NousApiRecord = { data?: NousModel[] }
