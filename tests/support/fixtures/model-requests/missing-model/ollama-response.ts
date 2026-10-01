export const ollamaMissingModelResponse = () =>
  new Response(
    JSON.stringify({
      error: {
        message: "model 'does-not-exist' not found",
        type: 'not_found_error',
        param: null,
        code: null,
      },
    }),
    {
      status: 404,
      statusText: 'Not Found',
      headers: {
        'content-type': 'application/json',
        'date': 'Thu, 01 Oct 2026 23:21:23 GMT',
        'content-length': '107',
      },
    },
  )
