import { spy } from '@std/testing/mock'

export const mockFetchSuccess = <T>(body: T) => {
  return spy((_input: string | URL | Request) => {
    return Promise.resolve(Response.json(body))
  })
}

export const mockFetchError = (status: number) => {
  return spy((_input: string | URL | Request) => {
    return Promise.resolve(new Response(null, { status }))
  })
}

export const mockFetchRejected = (message: string) => {
  return spy((_input: string | URL | Request) => {
    return Promise.reject(new Error(message))
  })
}
