export class FileDiffParser {
  parse(text: string): string[] {
    return text.split('\n')
      .filter((line) => line.length > 0)
      .map((line) =>
        this.unquote(line.replace(/^.../, '').replace(/.* -> /, ''))
      )
  }

  private unquote(path: string): string {
    if (
      path.length < 2 || !path.startsWith('"') || !path.endsWith('"')
    ) {
      return path
    }

    return path.slice(1, -1)
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
  }
}

export const fileDiffParser = () => {
  return new FileDiffParser()
}
