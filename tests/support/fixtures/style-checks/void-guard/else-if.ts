const finish = (): void => {}

export const run = (flag: boolean, other: boolean) => {
  if (flag) {
    finish()
  } else if (other) return finish()
  return 'ok'
}
