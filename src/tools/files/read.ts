import type { ApplicationData } from '../../application-data.ts'
import type { Logger } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { FileContent } from '../types.ts'

type CommandArguments = {
  path: string
  offset?: number
  limit?: number
}

type ReadFileArguments = {
  applicationData: ApplicationData
  commandArguments: CommandArguments
  pathPermissions?: PathPermissions
}

export class ReadFile {
  commandArguments: CommandArguments
  private permissions: PathPermissions
  private logger: Logger
  private text: string
  private succeeded: boolean

  constructor(
    {
      applicationData,
      commandArguments,
      pathPermissions = applicationData.pathPermissions(),
    }: ReadFileArguments,
  ) {
    this.commandArguments = commandArguments
    this.permissions = pathPermissions
    this.logger = applicationData.logger()
    this.text = ''
    this.succeeded = false
  }

  success() {
    return this.succeeded
  }

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.read()
    return this
  }

  result(): FileContent {
    return { path: this.commandArguments.path, text: this.text }
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.commandArguments.path)
    if (!allowed) {
      this.handleError(`path not allowed: ${this.commandArguments.path}`)
    }
    return !allowed
  }

  private async read() {
    try {
      const contents = await Deno.readTextFile(this.commandArguments.path)
      this.text = this.select(contents)
      this.succeeded = true
    } catch (error) {
      this.handleError((error as Error).message)
    }
  }

  private select(contents: string) {
    const lines = contents.split('\n')
    return lines.slice(this.firstLineIndex(), this.lastLineIndex(lines)).join(
      '\n',
    )
  }

  private firstLineIndex() {
    if (this.commandArguments.offset === undefined) return 0

    return this.commandArguments.offset - 1
  }

  private lastLineIndex(lines: string[]) {
    if (this.commandArguments.limit === undefined) return lines.length

    return this.firstLineIndex() + this.commandArguments.limit
  }

  private handleError(message: string) {
    this.logger.error(`File error: ${message}`)
  }
}

export const readFile = (args: ReadFileArguments) => {
  return new ReadFile(args)
}
