import type OpenAI from 'openai'
import { openAiClientOptions } from './openai-client.ts'
import { ModelRequestErrorHandler } from './model-request-error-handler.ts'
import type { ApplicationData } from '../../types.ts'
import type {
  ChatCompletionJson,
  ModelEndpoint,
  ModelMessages,
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

  private openAiClient() {
    return this.applicationData.openAiClient(
      openAiClientOptions(this.modelEndpoint, this.applicationData.fetchClient),
    )
  }

  private async createCompletion() {
    const completion = await this.openAiClient().chat.completions.create({
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
