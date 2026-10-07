import type { ApplicationOperationArguments, Logger } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { FileContent } from '../types.ts'

type TaskArguments = {
  path: string
  offset?: number
  limit?: number
}

type ReadFileArguments = ApplicationOperationArguments<TaskArguments> & {
  pathPermissions?: PathPermissions
}

export class ReadFile {
  operationArguments: TaskArguments
  private permissions: PathPermissions
  private logger: Logger
  private text: string
  private succeeded: boolean

  constructor(
    {
      applicationData,
      operationArguments,
      pathPermissions = applicationData.pathPermissions(),
    }: ReadFileArguments,
  ) {
    this.operationArguments = operationArguments
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
    return { path: this.operationArguments.path, text: this.text }
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.operationArguments.path)
    if (!allowed) {
      this.handleError(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async read() {
    try {
      const contents = await Deno.readTextFile(this.operationArguments.path)
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
    if (this.operationArguments.offset === undefined) return 0

    return this.operationArguments.offset - 1
  }

  private lastLineIndex(lines: string[]) {
    if (this.operationArguments.limit === undefined) return lines.length

    return this.firstLineIndex() + this.operationArguments.limit
  }

  private handleError(message: string) {
    this.logger.error(`File error: ${message}`)
  }
}

export const readFile = (args: ReadFileArguments) => {
  return new ReadFile(args)
}
