import type OpenAI from 'openai'
import { ModelRequestErrorHandler } from './model-request-error-handler.ts'
import { OperationWithResult } from '../../operation.ts'
import type {
  ChatCompletionJson,
  OpenAiClientOptions,
  OpenAiRequestArguments,
} from '../types.ts'

export class OpenAiRequest extends OperationWithResult<
  OpenAiRequestArguments,
  ChatCompletionJson | undefined
> {
  protected override logPrefix = 'OpenAI request: '
  error?: Error
  private completion?: ChatCompletionJson
  private startTime = 0
  private endTime = 0

  get url() {
    return `${this.modelEndpoint.baseURL}/chat/completions`
  }

  async run() {
    try {
      await this.send()
    } catch (error) {
      await this.recordFailure(error as Error)
    }
    return this
  }

  result() {
    return this.completion
  }

  benchmark() {
    return { startTime: this.startTime, endTime: this.endTime }
  }

  private get modelEndpoint() {
    return this.operationArguments.modelEndpoint
  }

  private get messages() {
    return this.operationArguments.messages
  }

  private async send() {
    this.startTime = performance.now()
    this.completion = await this.createCompletion()
    this.endTime = performance.now()
    this.succeeded = true
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
    this.succeeded = false
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
