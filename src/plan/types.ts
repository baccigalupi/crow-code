export type ModelEndpointDetails = {
  baseURL: string
  apiKey: string
  model: string
}

export type Message = {
  role: string
  content: string
}

export type Messages = Message[]
