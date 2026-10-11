import type { ApplicationOperationArguments } from '../../../types.ts'
import type { PathPermissions } from '../../../application-data/path-permissions.ts'
import type { EditResult } from '../../types.ts'
import { OperationWithResult } from '../../../operation.ts'

type TaskArguments = {
  path: string
  oldString: string
  newString: string
  replaceAll?: boolean
  pathPermissions?: PathPermissions
}

type EditFileArguments = ApplicationOperationArguments<TaskArguments>

export class EditFile extends OperationWithResult<TaskArguments, EditResult> {
  protected override logPrefix = 'Edit file: '
  private replacements = 0

  async run() {
    if (await this.pathNotAllowed()) return this

    this.validateArguments()
    await this.edit()
    return this
  }

  result() {
    return {
      path: this.operationArguments.path,
      replacements: this.replacements,
    }
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
    try {
      await this.tryEdit()
    } catch (error) {
      this.fail((error as Error).message)
    }
  }

  private async tryEdit() {
    const contents = await Deno.readTextFile(this.operationArguments.path)
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
    await Deno.writeTextFile(
      this.operationArguments.path,
      contents.replaceAll(oldString, newString),
    )
    this.replacements = this.occurrences(contents)
  }
}

export const editFile = (args: EditFileArguments) => {
  return new EditFile(args)
}
