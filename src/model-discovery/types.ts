export type CodingSource = 'AA' | 'Aider'

export type ProviderConfig = {
  name: string
  baseUrl: string
  modelsUrl?: string
}

export type ModelRecord = {
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

export type CacheFile = {
  fetchedAt: string
  modelCount: number
  models: ModelRecord[]
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
