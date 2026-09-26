export class FakeCommand {
  options: Deno.CommandOptions

  constructor(_command: string, options: Deno.CommandOptions) {
    this.options = options
  }

  output() {
    let stdout = new Uint8Array()
    if (this.options.args && this.options.args[0] === 'diff') {
      stdout = new TextEncoder().encode('fake diff')
    }
    return Promise.resolve({
      success: true,
      code: 0,
      signal: null,
      stdout,
      stderr: new Uint8Array(),
    })
  }
}
