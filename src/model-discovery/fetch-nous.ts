import { NousModel } from './types.js'

const nousUrl = 'https://inference-api.nousresearch.com/v1/models'

interface NousResponse {
  data: NousModel[]
}

const parseNousResponse = (raw: unknown): NousModel[] => {
  const body = raw as NousResponse
  if (body.data === undefined) {
    return []
  }
  return body.data
}

export const fetchNousModels = async (): Promise<NousModel[]> => {
  try {
    const response = await fetch(nousUrl, {
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) {
      console.error(`Nous API returned ${response.status}`)
      return []
    }
    return parseNousResponse(await response.json())
  } catch {
    console.error(`Nous API unreachable at ${nousUrl}`)
    return []
  }
}
