export const nousMissingModelResponse = () =>
  new Response(
    JSON.stringify({
      status: 404,
      message:
        "Model 'does-not-exist' not found. The requested model does not exist in our configuration or OpenRouter catalog.",
    }),
    {
      status: 404,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:21:23 GMT',
        'content-type': 'application/json',
        'content-length': '139',
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'X-Nous-Token-Sharing',
        'server': 'cloudflare',
        'x-railway-request-id': 'ynP4qUqIR86I5Zed-_9nXA',
        'x-hikari-trace': 'lax1.v9kt',
        'x-railway-edge': 'lax1',
        'cf-cache-status': 'DYNAMIC',
        'set-cookie':
          '__cf_bm=vbd9oCYudYYngK.vtdtVwnRuw7CF..AYktz.rH.EVW4-1790896883.5799515-1.0.1.1-6JxjRxw_m4bLE9nD2qz7nHoAKjOYMl0pndvlu4tYu20vyiAG6zHLX3H4169o8AckKdAKdh.PAkU_wOE1aigtdyEC19Q1XK0VXdtU8KgmOU9BIzz.tAvzF9GbUcPl4NhH; HttpOnly; SameSite=None; Secure; Path=/; Domain=nousresearch.com; Expires=Thu, 01 Oct 2026 23:51:23 GMT',
        'cf-ray': 'a43f341259559e6b-SJC',
      },
    },
  )
