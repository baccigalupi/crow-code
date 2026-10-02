class Example {
  private empty(): string {
    return ''
  }

  run(flag: boolean) {
    if (!flag) return this.empty()
    return 'ok'
  }
}

export { Example }
