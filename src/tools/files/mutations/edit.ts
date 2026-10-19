import type { ApplicationOperationArguments } from '../../../types.ts'
import type { EditResult } from '../../types.ts'
import { FileOperation } from '../file-operation.ts'

type TaskArguments = {
  path: string
  oldString: string
  newString: string
  replaceAll?: boolean
}

type EditFileArguments = ApplicationOperationArguments<TaskArguments>

export class EditFile extends FileOperation<TaskArguments, EditResult> {
  protected override logPrefix = 'Edit file: '
  private replacements = 0

  result() {
    return {
      path: this.operationArguments.path,
      replacements: this.replacements,
    }
  }

  protected override async perform() {
    this.validateArguments()
    await this.edit()
  }

  private validateArguments() {
    const { oldString, newString } = this.operationArguments
    if (oldString === '') {
      this.fail('oldString must be empty')
    } else if (oldString === newString) {
      this.fail('oldString and newString are identical')
    }
  }

  private async edit() {
    if (!this.succeeded) return

    const contents = await this.applicationData.filesystem.readTextFile(
      this.operationArguments.path,
    )
    this.failUnmatched(contents)
    if (this.succeeded) await this.write(contents)
  }

  private failUnmatched(contents: string) {
    const count = this.occurrences(contents)
    if (count === 0) {
      this.fail('oldString not found in file')
    } else if (count > 1 && !this.operationArguments.replaceAll) {
      this.fail(`oldString is not unique: found ${count} occurrences`)
    }
  }

  private occurrences(contents: string) {
    return contents.split(this.operationArguments.oldString).length - 1
  }

  private async write(contents: string) {
    const { oldString, newString } = this.operationArguments
    await this.applicationData.filesystem.writeTextFile(
      this.operationArguments.path,
      contents.replaceAll(oldString, newString),
    )
    this.replacements = this.occurrences(contents)
  }
}

export const editFile = (args: EditFileArguments) => {
  return new EditFile(args)
}
