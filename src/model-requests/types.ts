import type { ApplicationOperationArguments } from '../types.ts'
import type { GitFileDiff } from '../tools/types.ts'
import type { ModelApiRequest } from './framework/model-api-request.ts'

export type OpenAiClientOptions = {
  apiKey: string
  baseURL: string
}

export type ModelMessages = {
  role: string
  content: string
}

export type ModelEndpoint = {
  baseURL: string
  apiKey: string
  model: string
  providerId: number
}

export type RequestMessages<T> = (input: T) => ModelMessages[]

export type OpenAiRequestArguments = {
  modelEndpoint: ModelEndpoint
  messages: ModelMessages[]
}

export type ModelApiRequestArguments<TRequest> = {
  modelEndpoint: ModelEndpoint
  requestData: TRequest
}

export type ModelApiRequestClass<TRequest, TResponse> = new (
  args: ApplicationOperationArguments<ModelApiRequestArguments<TRequest>>,
) => ModelApiRequest<TRequest, TResponse>

export type CommitMessageRequest = {
  goal: string
  changes: GitFileDiff[]
  recentSubjects: string[]
  includeRecentSubjects?: boolean
}

export type CommitMessage = {
  subject: string
  body: string
}

export type ModelRequestFailureReason =
  | ''
  | 'api-error'
  | 'invalid-json'
  | 'invalid-schema'

export type Timespan = {
  startTime: number
  endTime: number
}

type ChatChoices = {
  message: {
    content: string
    [key: string]: unknown
  }
  [key: string]: unknown
}[]

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json }

export type ChatCompletionJson = {
  choices: ChatChoices
  usage: {
    completion_tokens: number
    completion_tokens_details?: {
      reasoning_tokens: number
      [key: string]: unknown
    }
    cost?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}
