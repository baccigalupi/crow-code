import { OllamaModel } from './types.js'

const ollamaUrl = 'http://pile-driver.local:11434/api/tags'

interface OllamaResponse {
  models: OllamaModel[]
}

const parseOllamaResponse = (raw: unknown): OllamaModel[] => {
  const body = raw as OllamaResponse
  if (body.models === undefined) {
    return []
  }
  return body.models
}

export const fetchOllamaModels = async (): Promise<OllamaModel[]> => {
  try {
    const response = await fetch(ollamaUrl, {
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      console.error(`Ollama returned ${response.status}`)
      return []
    }
    return parseOllamaResponse(await response.json())
  } catch {
    console.error(`Ollama unreachable at ${ollamaUrl}`)
    return []
  }
}
