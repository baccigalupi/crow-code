const finish = (): void => {}

export const run = (flag: boolean) => {
  if (flag) {
    finish()
    return finish()
  }
  return 'ok'
}
