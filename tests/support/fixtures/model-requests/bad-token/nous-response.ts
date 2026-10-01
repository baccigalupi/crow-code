export const nousBadTokenResponse = () =>
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
        'date': 'Thu, 01 Oct 2026 23:26:01 GMT',
        'content-type': 'application/json',
        'content-length': '154',
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'X-Nous-Token-Sharing',
        'server': 'cloudflare',
        'x-railway-request-id': 'Rs7GHFLhR4azFKWJ0_TJvA',
        'x-hikari-trace': 'lax1.z1hw',
        'x-railway-edge': 'lax1',
        'cf-cache-status': 'DYNAMIC',
        'set-cookie':
          '__cf_bm=trBgB9mX0wvL2YFCvz9_Zt8PhWuJNbrk4HUQyc5q9aQ-1790897161.3250768-1.0.1.1-Pdf2SUa3SwMxQGiO1iFk0maD02z_W0Z4bLDe..TNK_GyIjT8Gbfq.OaQds6RWe0VLDjhSdQWx_gVQYx5DPf4mnUNnnYw1Fs_En7RBN38ZDjPT0ZxD99iGOHmeBXCzSoy; HttpOnly; SameSite=None; Secure; Path=/; Domain=nousresearch.com; Expires=Thu, 01 Oct 2026 23:56:01 GMT',
        'cf-ray': 'a43f3ada4a11f4d9-SJC',
      },
    },
  )
