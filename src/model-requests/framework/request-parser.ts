import type {
  ChatCompletionJson,
  Json,
  ModelRequestFailureReason,
} from '../types.ts'
import type { OpenAiRequest } from './openai-request.ts'
import { type ModelAnswer, modelAnswer } from './model-answer.ts'

type SchemaValidator = (json: Json) => boolean

export class RequestParser<TResponse> {
  apiRequest: OpenAiRequest
  succeeded: boolean
  answer!: ModelAnswer
  parsedResponse?: Json
  reason: string
  schemaValidator: SchemaValidator

  constructor(apiRequest: OpenAiRequest, schemaValidator: SchemaValidator) {
    this.apiRequest = apiRequest
    this.succeeded = false 
    this.reason = ''
    this.schemaValidator = schemaValidator 
  }

  async run() {
    if (!this.apiRequest.success()) return this.fail('api-error')

    const json = await this.apiRequest.json() as ChatCompletionJson
    this.answer = modelAnswer(json, this.apiRequest.benchmark())
    this.parsedResponse = this.answer.answerAsJson()
    return this.validateJson()
  }

  private validateJson() {
    if (!this.parsedResponse) return this.fail('invalid-json')

    return this.validateSchema()
  }

  private validateSchema() {
    if (!this.schemaValidator(this.parsedResponse!)) return this.fail('invalid-schema')

    this.succeeded = true
    return this.parsedResponse as TResponse
  }

  private fail(reason: ModelRequestFailureReason) {
    this.succeeded = false
    this.reason = reason
  }
}