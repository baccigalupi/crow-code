const finish = (): void => {}

export const run = (flag: boolean) => {
  if (flag) return finish()!
  return 'ok'
}
