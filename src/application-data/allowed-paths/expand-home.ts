import { join } from '@std/path'
import type { Environment } from '../env-vars.ts'

type ExpandHomeArguments = {
  directories: string[]
  envars: Environment
}

export class ExpandHome {
  private home: string
  private unexpanded: string[]

  constructor({ directories, envars }: ExpandHomeArguments) {
    this.unexpanded = directories
    this.home = envars.value('HOME')
  }

  directories() {
    return this.unexpanded
      .filter((directory) => !this.isOtherUser(directory))
      .map((directory) => this.expand(directory))
  }

  private isHome(directory: string) {
    return directory === '~' || directory.startsWith('~/')
  }

  private isOtherUser(directory: string) {
    return directory.startsWith('~') && !this.isHome(directory)
  }

  private expand(directory: string) {
    if (!this.isHome(directory)) return directory

    return join(this.home, directory.slice(1))
  }
}

export const expandHome = (args: ExpandHomeArguments) => {
  return new ExpandHome(args)
}
