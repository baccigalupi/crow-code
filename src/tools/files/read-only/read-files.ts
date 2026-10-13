import type { ApplicationOperationArguments } from '../../../types.ts'
import type { FileContent } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'
import { ReadFile, readFile } from './read.ts'

type TaskArguments = {
  paths: string[]
}

type ReadFilesArguments = ApplicationOperationArguments<TaskArguments>

export class ReadFiles
  extends OperationWithResult<TaskArguments, FileContent[]> {
  protected override logPrefix = 'Read files: '

  async run() {
    await this.readAll()
    this.failIfAllReadsFailed()
    return this
  }

  result() {
    return this.subOperations
      .filter((operation) => operation.success())
      .map((operation) => (operation as ReadFile).result())
  }

  private async readAll() {
    const reads = this.operationArguments.paths.map((path) => this.read(path))
    this.subOperations.push(...await Promise.all(reads))
  }

  private async read(path: string) {
    const file = this.reader(path)
    await file.run()
    return file
  }

  private reader(path: string) {
    return readFile({
      applicationData: this.applicationData,
      operationArguments: { path },
    })
  }

  private allReadsFailed() {
    return this.subOperations.length > 0 &&
      this.subOperations.every((operation) => !operation.success())
  }

  private failIfAllReadsFailed() {
    if (this.allReadsFailed()) {
      this.fail(
        `failed to read all ${this.operationArguments.paths.length} paths`,
      )
    }
  }
}

export const readFiles = (args: ReadFilesArguments) => {
  return new ReadFiles(args)
}
