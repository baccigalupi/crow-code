export const openrouterMissingModelResponse = () =>
  new Response(
    JSON.stringify({
      error: { message: 'does-not-exist is not a valid model ID', code: 400 },
      user_id: 'user_3JG0vdssEflsehZe8o5aYYpLzzY',
    }),
    {
      status: 400,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:21:23 GMT',
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'access-control-expose-headers':
          'X-Generation-Id,X-Provider-Name,request-id,cf-ray',
        'x-generation-id': 'gen-1790896883-Si3L2WT8WX5HcHkJHdWq',
        'set-cookie':
          '__cf_bm=hfnsH3n2jU.VfhccRBOjjiEAGa6RjTONBGxtRaQMt_Y-1790896883.4197795-1.0.1.1-fKyfIl2RKv_DcUoVQFoErADsv4HtHunxnw4Mt2q8YJSwkD5oZorYkF4LV3hRKD6D0GV9ZfItfX0lnC4ukWuzGH7qbcmJdNnsxrVnEl2c3hddJSUUNpLz_.GzKRBa.Vgi; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Thu, 01 Oct 2026 23:51:23 GMT',
        'permissions-policy':
          'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
        'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
        'x-content-type-options': 'nosniff',
        'server': 'cloudflare',
        'cf-ray': 'a43f34115c621643-SJC',
      },
    },
  )
