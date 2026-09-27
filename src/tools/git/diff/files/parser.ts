export class FileDiffParser {
  parse(text: string): string[] {
    return text.split('\n')
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^.../, '').replace(/.* -> /, ''))
  }
}

export const fileDiffParser = () => {
  return new FileDiffParser()
}
