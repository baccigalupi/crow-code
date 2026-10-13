import { OperationWithResult } from '../../operation.ts'

type FileArguments = { path: string }

export abstract class FileOperation<
  OperationArguments extends FileArguments,
  Result,
> extends OperationWithResult<OperationArguments, Result> {
  async run() {
    if (await this.pathNotAllowed()) return this

    await this.attempt()
    return this
  }

  protected abstract perform(): Promise<void>

  private async pathNotAllowed() {
    const allowed = await this.applicationData.pathPermissions().allows(
      this.operationArguments.path,
    )
    if (!allowed) {
      this.fail(`path not allowed: ${this.operationArguments.path}`)
    }
    return !allowed
  }

  private async attempt() {
    try {
      await this.perform()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }
}
