const createFetchMock = (
  respond: (input: string | URL | Request) => Promise<Response>,
) => {
  const calls: (string | URL | Request)[] = []
  const fetchMock = (input: string | URL | Request) => {
    calls.push(input)
    return respond(input)
  }
  return Object.assign(fetchMock, { calls })
}

export const mockFetchSuccess = <T>(body: T) => {
  return createFetchMock(() => Promise.resolve(Response.json(body)))
}

export const mockFetchError = (status: number) => {
  return createFetchMock(() => {
    return Promise.resolve(new Response(null, { status }))
  })
}

export const mockFetchRejected = (message: string) => {
  return createFetchMock(() => Promise.reject(new Error(message)))
}

export const mockFetchRoutes = (routes: [string, unknown][]) => {
  return createFetchMock((input) => {
    const address = String(input)
    const route = routes.find(([pattern]) => address.includes(pattern))
    return Promise.resolve(Response.json(route![1]))
  })
}
