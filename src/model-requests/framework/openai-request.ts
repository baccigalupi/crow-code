import type OpenAI from 'openai'
import { ModelRequestErrorHandler } from './model-request-error-handler.ts'
import type { ApplicationData } from '../../application-data.ts'
import type {
  ChatCompletionJson,
  ModelEndpoint,
  ModelMessages,
  OpenAiClientOptions,
} from '../types.ts'

export class OpenAiRequest {
  url: string
  error?: Error
  modelEndpoint: ModelEndpoint
  private messages: ModelMessages[]
  applicationData: ApplicationData
  private completion?: ChatCompletionJson
  private startTime: number
  private endTime: number

  constructor(
    modelEndpoint: ModelEndpoint,
    messages: ModelMessages[],
    applicationData: ApplicationData,
  ) {
    this.modelEndpoint = modelEndpoint
    this.messages = messages
    this.applicationData = applicationData
    this.url = `${modelEndpoint.baseURL}/chat/completions`
    this.startTime = 0
    this.endTime = 0
  }

  async run() {
    try {
      await this.send()
    } catch (error) {
      await this.recordFailure(error as Error)
    }
  }

  success() {
    return this.completion !== undefined
  }

  benchmark() {
    return { startTime: this.startTime, endTime: this.endTime }
  }

  async json() {
    return await Promise.resolve(this.completion)
  }

  private async send() {
    this.startTime = performance.now()
    this.completion = await this.createCompletion()
    this.endTime = performance.now()
  }

  private chatClient() {
    return this.applicationData.chatClient(this.openAiClientOptions())
  }

  private openAiClientOptions(): OpenAiClientOptions {
    return {
      apiKey: this.apiKey(),
      baseURL: this.modelEndpoint.baseURL,
    }
  }

  private apiKey() {
    if (this.modelEndpoint.apiKey === '') return 'crow-no-api-key'
    return this.modelEndpoint.apiKey
  }

  private async createCompletion() {
    const completion = await this.chatClient().chat.completions.create({
      model: this.modelEndpoint.model,
      messages: this.messages as OpenAI.ChatCompletionMessageParam[],
    })
    return completion as unknown as ChatCompletionJson
  }

  private async recordFailure(error: Error) {
    this.endTime = performance.now()
    this.error = error
    await this.errorHandler().run()
  }

  private errorHandler() {
    return new ModelRequestErrorHandler(
      this.applicationData,
      this.modelEndpoint,
      this.url,
      this.error as Error,
    )
  }
}
