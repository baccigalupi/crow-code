import type pino from 'pino'

export type Logger = pino.Logger

export type ReasoningControl = 'toggle' | 'effort' | 'budget_tokens'

export type ProviderConfig = {
  name: string
  baseUrl: string
  modelsUrl?: string
  apiKeyEnv?: string
}

export type ModelInfo = {
  id: string
  name: string
  provider: string
  reasoning: boolean | null
  reasoningControls: ReasoningControl[]
  intelligence: number | null
  coding: number | null
  agentic: number | null
  costInput: number
  costOutput: number
  contextLength: number | null
  modality: string
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
  reasoning: boolean | null
}

export type AAModel = {
  slug: string
  model_creator: { name: string }
  reasoning_model?: boolean | null
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
  supported_parameters?: string[]
  architecture?: { modality?: string }
}

export type NousApiRecord = { data?: NousModel[] }

export type OllamaModel = {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

export type OllamaApiRecord = { models?: OllamaModel[] }

export type OpenRouterPricing = {
  prompt?: string
  completion?: string
}

export type OpenRouterModel = {
  id: string
  name?: string
  context_length?: number
  pricing?: OpenRouterPricing
  supported_parameters?: string[]
  architecture?: { modality?: string }
}

export type OpenRouterApiRecord = { data?: OpenRouterModel[] }

export type ModelsDevEntry = {
  reasoning: boolean | null
  reasoningControls: ReasoningControl[]
}

export type ModelsDevCatalog = Record<string, Record<string, ModelsDevEntry>>
