export class GitRevListParser {
  parse(stdout: string) {
    return { shas: stdout.split('\n').filter((line) => line !== '') }
  }
}
