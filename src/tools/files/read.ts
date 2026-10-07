import type { ApplicationOperationArguments } from '../../types.ts'
import type { PathPermissions } from '../path-permissions.ts'
import type { FileContent } from '../types.ts'
import { OperationWithResult } from '../../operation.ts'

type TaskArguments = {
  path: string
  offset?: number
  limit?: number
  pathPermissions?: PathPermissions
}

type ReadFileArguments = ApplicationOperationArguments<TaskArguments>

export class ReadFile extends OperationWithResult<TaskArguments, FileContent> {
  protected override logPrefix = 'Read file: '
  private text = ''

  async run() {
    if (await this.pathNotAllowed()) return this

    await this.read()
    return this
  }

  result(): FileContent {
    return { path: this.operationArguments.path, text: this.text }
  }

  private get permissions() {
    if (this.operationArguments.pathPermissions) {
      return this.operationArguments.pathPermissions
    }
    return this.applicationData.pathPermissions()
  }

  private async pathNotAllowed() {
    const allowed = await this.permissions.allows(this.operationArguments.path)
    if (!allowed) {
      this.fail(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async read() {
    try {
      const contents = await Deno.readTextFile(this.operationArguments.path)
      this.text = this.select(contents)
    } catch (error) {
      this.fail((error as Error).message)
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
}

export const readFile = (args: ReadFileArguments) => {
  return new ReadFile(args)
}
