export const nousNoTokenResponse = () =>
  new Response(
    JSON.stringify({
      status: 400,
      message:
        'This request is not valid. Check the model name and other parameters. Additional info: Unknown model: xiaomi/mimo-v2.6-flash. Please specify a valid model.',
    }),
    {
      status: 400,
      statusText: '',
      headers: {
        'date': 'Thu, 01 Oct 2026 23:26:34 GMT',
        'content-type': 'application/json',
        'content-length': '182',
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'X-Nous-Token-Sharing',
        'server': 'cloudflare',
        'x-402-accept': 'solana',
        'x-railway-request-id': 'zOA5MsNuTEiLihqInPRhug',
        'x-hikari-trace': 'lax1.v9kt',
        'x-railway-edge': 'lax1',
        'cf-cache-status': 'DYNAMIC',
        'set-cookie':
          '__cf_bm=jTBOZXGyS5FqcwW.WMKmg02eqK5bhL.TiRJ99CObzSs-1790897193.7919412-1.0.1.1-Wz3kJ7_rbMbZq.ujNG2rnob_1q4bBTe5PSudPW31XldS28VRbGjb2e851e6C5H5.Xza.gSzwezoUsbAsvrUY8w_eoBPpQDMkaHtWB9XnMA9a1.SvyB1qQGJz0XDqdkak; HttpOnly; SameSite=None; Secure; Path=/; Domain=nousresearch.com; Expires=Thu, 01 Oct 2026 23:56:34 GMT',
        'cf-ray': 'a43f3ba538702c2d-SJC',
      },
    },
  )
