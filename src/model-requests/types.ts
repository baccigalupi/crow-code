export type ModelMessages = {
  role: string
  content: string
}

export type ModelEndpoint = {
  baseURL: string
  apiKey: string
  model: string
}

export type RequestMessages<T> = (input: T) => ModelMessages[]
