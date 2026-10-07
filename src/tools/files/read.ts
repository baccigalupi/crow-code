import type { AsyncTaskArgument, Logger } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { FileContent } from '../types.ts'

type TaskArguments = {
  path: string
  offset?: number
  limit?: number
}

type ReadFileArguments = AsyncTaskArgument<TaskArguments> & {
  pathPermissions?: PathPermissions
}

export class ReadFile {
  taskArguments: TaskArguments
  private permissions: PathPermissions
  private logger: Logger
  private text: string
  private succeeded: boolean

  constructor(
    {
      applicationData,
      taskArguments,
      pathPermissions = applicationData.pathPermissions(),
    }: ReadFileArguments,
  ) {
    this.taskArguments = taskArguments
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
    return { path: this.taskArguments.path, text: this.text }
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.taskArguments.path)
    if (!allowed) {
      this.handleError(`path not allowed: ${this.taskArguments.path}`)
    }
    return !allowed
  }

  private async read() {
    try {
      const contents = await Deno.readTextFile(this.taskArguments.path)
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
    if (this.taskArguments.offset === undefined) return 0

    return this.taskArguments.offset - 1
  }

  private lastLineIndex(lines: string[]) {
    if (this.taskArguments.limit === undefined) return lines.length

    return this.firstLineIndex() + this.taskArguments.limit
  }

  private handleError(message: string) {
    this.logger.error(`File error: ${message}`)
  }
}

export const readFile = (args: ReadFileArguments) => {
  return new ReadFile(args)
}
