import type { ApplicationOperationArguments } from '../../../types.ts'
import type { FileContent } from '../../types.ts'
import { ReadOnlyFileOperation } from './base-operation.ts'

type TaskArguments = {
  path: string
  offset?: number
  limit?: number
}

type ReadFileArguments = ApplicationOperationArguments<TaskArguments>

export class ReadFile
  extends ReadOnlyFileOperation<TaskArguments, FileContent> {
  protected override logPrefix = 'Read file: '
  private text = ''

  result() {
    return { path: this.operationArguments.path, text: this.text }
  }

  protected override async perform() {
    const contents = await this.applicationData.runtime.readTextFile(
      this.operationArguments.path,
    )
    this.text = this.select(contents)
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
