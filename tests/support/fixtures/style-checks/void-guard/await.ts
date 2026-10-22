const finish = async (): Promise<void> => {}

export const run = async (flag: boolean) => {
  if (flag) return await finish()
  return 'ok'
}
