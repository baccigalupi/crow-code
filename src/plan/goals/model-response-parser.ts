import { parseGoals } from './parse-goals.ts'
import { ExtractModelResponse } from '../extract-model-response.ts'

export const parseModelResponse = (response: Response) => {
  return new ExtractModelResponse(response, parseGoals).extract()
}
