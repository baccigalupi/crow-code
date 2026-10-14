import { FileOperation } from '../file-operation.ts'

type FileArguments = { path: string }

export abstract class ReadOnlyFileOperation<
  OperationArguments extends FileArguments,
  Result,
> extends FileOperation<OperationArguments, Result> {
  protected override permissions() {
    return this.applicationData.readPathPermissions()
  }
}
