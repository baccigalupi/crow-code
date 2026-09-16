import { assertSpyCalls, returnsNext, stub } from "jsr:@std/testing/mock";

const mockSuccessResponse= <T>(jsonData: T) => {
  return {
    ok: true,
    status: 200,
    json: async () => (jsonData),
  }
}

const mockErrorResponse = (status: number) => {
  return {
    ok: false,
    status,
    json: async () => ({}),
  }
}

export const mockFetchSuccess = <T>(response: T) => {
  const _internals = { fetch }
  const resolvedResponse = Promise.resolve(mockSuccessResponse(response))
  using fetchStub = stub(_internals, 'fetch', returnsNext([resolvedResponse]))

  return fetchStub
}

export const mockFetchError = (status: number) => {
  const _internals = { fetch }
  const resolvedResponse = Promise.resolve(mockErrorResponse(status))
  using fetchStub = stub(_internals, 'fetch', returnsNext([resolvedResponse]))

  return fetchStub
}

export const mockFetchRejected = (message: string) => {
  const _internals = { fetch }
  const rejectedResponse = Promise.reject(new Error(message))
  using fetchStub = stub(_internals, 'fetch', returnsNext([rejectedResponse]))

  return fetchStub
}