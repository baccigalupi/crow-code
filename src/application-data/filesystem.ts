import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { join } from 'node:path'

export class Filesystem {
  readTextFile(path: string) {
    return readFile(path, 'utf8')
  }

  writeTextFile(path: string, text: string) {
    return writeFile(path, text)
  }

  async readBytes(path: string) {
    return new Uint8Array(await readFile(path))
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

  removeTree(path: string) {
    return rm(path, { recursive: true })
  }

  async isDirectory(path: string) {
    const stats = await lstat(path)
    return stats.isDirectory()
  }

  async directoryEntries(path: string) {
    const names = await readdir(path)
    return names.sort().map((name) => join(path, name))
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
