class Example {
  private fail(): void {
    return
  }

  run(flag: boolean) {
    if (!flag) return this.fail()
    return 'ok'
  }
}

export { Example }
