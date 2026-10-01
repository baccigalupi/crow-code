export const openrouterNoTokenResponse = () =>
  new Response(
    JSON.stringify({
      error: { message: 'No cookie auth credentials found', code: 401 },
    }),
    {
      status: 401,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:26:01 GMT',
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-expose-headers':
          'X-Generation-Id,X-Provider-Name,request-id,cf-ray',
        'set-cookie':
          '__cf_bm=DO.TTOs1IHVG_v1Oyf3ew1fEOxWOOe7zQ7RiNeGwiN0-1790897161.0103204-1.0.1.1-DPFHhZae1Pd8Od9.pGO8Uo1.vEBTJVnolf1Zyy0MNsOsUVqJEUvZrOkmHM_WjdJbtUoVz4r9njKG9dCz.5H0yyw3nOQD4Vw_tCiBhW8s6UYtG3wUox4_B5S7g4G11fOP; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Thu, 01 Oct 2026 23:56:01 GMT',
        'permissions-policy':
          'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
        'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
        'x-content-type-options': 'nosniff',
        'server': 'cloudflare',
        'cf-ray': 'a43f3ad849dcf897-SJC',
      },
    },
  )
