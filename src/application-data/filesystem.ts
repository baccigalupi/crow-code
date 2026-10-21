import {
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises'

export class Filesystem {
  readTextFile(path: string) {
    return readFile(path, 'utf8')
  }

  writeTextFile(path: string, text: string) {
    return writeFile(path, text)
  }

  async mkdirWithParents(path: string) {
    await mkdir(path, { recursive: true })
  }

  rename(from: string, to: string) {
    return rename(from, to)
  }

  async remove(path: string) {
    const stats = await lstat(path)
    if (stats.isDirectory()) {
      await rmdir(path)
    } else {
      await unlink(path)
    }
  }

  async assertExists(path: string) {
    await lstat(path)
  }

  realPath(path: string) {
    return realpath(path)
  }

  isNotFound(error: unknown) {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT'
  }
}

export const defaultFilesystem = () => {
  return new Filesystem()
}
