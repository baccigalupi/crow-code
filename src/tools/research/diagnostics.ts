import type { ApplicationOperationArguments } from '../../types.ts'
import type {
  Diagnostic,
  FileDiagnostics,
  ParsedFile,
} from './language-parsers/types.ts'
import { ReadOnlyFileOperation } from '../files/read-only/base-operation.ts'
import { SyntaxErrors } from './diagnostics/syntax-errors.ts'
import { parseFile } from './parse-file.ts'

type TaskArguments = { path: string }

type DiagnosticsArguments = ApplicationOperationArguments<TaskArguments>

export class Diagnostics extends ReadOnlyFileOperation<
  TaskArguments,
  FileDiagnostics
> {
  protected override logPrefix = 'Syntax diagnostics: '
  private language = ''
  private diagnostics: Diagnostic[] = []

  result() {
    const path = this.operationArguments.path
    return { path, language: this.language, diagnostics: this.diagnostics }
  }

  protected override async perform() {
    const parsed = await this.runSubOperation(
      parseFile({
        applicationData: this.applicationData,
        operationArguments: this.operationArguments,
      }),
    )
    if (this.succeeded) this.diagnose(parsed.result())
  }

  private diagnose(parsed: ParsedFile) {
    this.language = parsed.language
    this.diagnostics = new SyntaxErrors(parsed.tree!.rootNode).diagnostics()
  }
}

export const diagnostics = (args: DiagnosticsArguments) => {
  return new Diagnostics(args)
}
