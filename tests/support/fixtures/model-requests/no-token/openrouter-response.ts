export const openrouterNoTokenResponse = () =>
  new Response(
    JSON.stringify({
      error: { message: 'Missing Authentication header', code: 401 },
    }),
    {
      status: 401,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:39:34 GMT',
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-expose-headers':
          'X-Generation-Id,X-Provider-Name,request-id,cf-ray',
        'set-cookie':
          '__cf_bm=DNfXNKY4O2xOeubvZVoYmht0L4UvFn4ZVJOVqQc_5Jc-1790897974.6035933-1.0.1.1-l0H49ixAeWCmo001TSm.eO1nkZ53ydmqeMFHndvr4.Yqd.fWBc4V.oJ4JntpYV0eLQofRKvUuFCsVfKIvwgA2K5vf8w60AEdlDGWe.Gr.TCw5wK9FeSWbMamInVTzNic; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Fri, 02 Oct 2026 00:09:34 GMT',
        'permissions-policy':
          'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
        'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
        'x-content-type-options': 'nosniff',
        'server': 'cloudflare',
        'cf-ray': 'a43f4eb54f492832-SJC',
      },
    },
  )
