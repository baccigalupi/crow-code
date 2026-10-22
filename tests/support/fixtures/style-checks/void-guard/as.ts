const finish = (): void => {}

export const run = (flag: boolean) => {
  if (flag) return finish() as unknown as string
  return 'ok'
}
