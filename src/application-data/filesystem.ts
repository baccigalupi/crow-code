export class Filesystem {
  private deno: typeof Deno

  constructor(deno: typeof Deno) {
    this.deno = deno
  }

  readTextFile(path: string) {
    return this.deno.readTextFile(path)
  }

  writeTextFile(path: string, text: string) {
    return this.deno.writeTextFile(path, text)
  }

  mkdirWithParents(path: string) {
    return this.deno.mkdir(path, { recursive: true })
  }

  rename(from: string, to: string) {
    return this.deno.rename(from, to)
  }

  remove(path: string) {
    return this.deno.remove(path)
  }

  async assertExists(path: string) {
    await this.deno.lstat(path)
  }

  realPath(path: string) {
    return this.deno.realPath(path)
  }

  isNotFound(error: unknown) {
    return error instanceof this.deno.errors.NotFound
  }
}

export const defaultFilesystem = () => {
  return new Filesystem(globalThis.Deno)
}
