export const nousNoTokenResponse = () =>
  new Response(
    JSON.stringify({
      status: 401,
      message:
        'Your API key is invalid, blocked or out of funds. Please go visit the portal to sort that out: https://portal.nousresearch.com ',
    }),
    {
      status: 401,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:39:34 GMT',
        'content-type': 'application/json',
        'content-length': '154',
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'X-Nous-Token-Sharing',
        'server': 'cloudflare',
        'x-railway-request-id': 'Q8KKkuNXR9qAE_x6-_9nXA',
        'x-hikari-trace': 'lax1.sx7j',
        'x-railway-edge': 'lax1',
        'cf-cache-status': 'DYNAMIC',
        'set-cookie':
          '__cf_bm=sY8wGq9o_Q3XKXiLVjSURC7c8fZJ7HD6PjyxDJ6_re0-1790897974.6819427-1.0.1.1-UL7P7M2N50XB23DU6BWgeVrQxevcs1ejHDhulA.aEYNMLu4SI0S6RDuVfV_j1mPcZyl73Do9UbFgk1fz7qpvMGJOvDDK3V7B_S6_SmXYpE98xEr2acA2l2pfIPWmKc5o; HttpOnly; SameSite=None; Secure; Path=/; Domain=nousresearch.com; Expires=Fri, 02 Oct 2026 00:09:34 GMT',
        'cf-ray': 'a43f4eb5cd5ce196-SJC',
      },
    },
  )
