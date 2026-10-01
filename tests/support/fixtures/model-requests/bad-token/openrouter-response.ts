export const openrouterBadTokenResponse = () =>
  new Response(
    JSON.stringify({ error: { message: 'User not found.', code: 401 } }),
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
          '__cf_bm=.2aKhz_z72fhc0VTHJrzXXke8BR3Lj6fcrG3f_WygtY-1790897161.0808096-1.0.1.1-QyrFwW1sMi4OG3zfesjRYqq08kr2Q14cfF0BX8qfdWmRScd_58reV.C.XXIa9eqDv8ZhM4bUXeTP.Zrcgc8WssBKJus6ykVjSInTe7KC2vqAbAQLr.lj788OebIUjr42; HttpOnly; SameSite=None; Secure; Path=/; Domain=openrouter.ai; Expires=Thu, 01 Oct 2026 23:56:01 GMT',
        'permissions-policy':
          'payment=(self "https://checkout.stripe.com" "https://connect-js.stripe.com" "https://js.stripe.com" "https://*.js.stripe.com" "https://hooks.stripe.com")',
        'referrer-policy': 'no-referrer, strict-origin-when-cross-origin',
        'x-content-type-options': 'nosniff',
        'server': 'cloudflare',
        'cf-ray': 'a43f3ad8be2c053e-SJC',
      },
    },
  )
