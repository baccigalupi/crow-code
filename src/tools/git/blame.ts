import type { ApplicationOperationArguments } from '../../types.ts'
import { GitExec } from './git-exec.ts'
import { blameParser } from './blame/parser.ts'
import type { GitBlameLine } from '../types.ts'

type TaskArguments = {
  path: string
  start?: number
  end?: number
  rev?: string
}

type GitBlameArguments = ApplicationOperationArguments<TaskArguments>

export class GitBlame extends GitExec<TaskArguments, GitBlameLine[]> {
  protected override logPrefix = 'Git blame: '

  executableOptions() {
    return { args: this.blameArgs() }
  }

  protected requestedPaths() {
    return [this.operationArguments.path]
  }

  private blameArgs() {
    const args = ['blame', '--line-porcelain', ...this.rangeArgs()]
    if (this.operationArguments.rev) args.push(this.operationArguments.rev)
    args.push('--', this.operationArguments.path)
    return args
  }

  private rangeArgs() {
    if (this.noRange()) return []
    return ['-L', `${this.bound('start')},${this.bound('end')}`]
  }

  private noRange() {
    return this.operationArguments.start === undefined &&
      this.operationArguments.end === undefined
  }

  private bound(key: 'start' | 'end') {
    if (this.operationArguments[key] === undefined) return ''
    return String(this.operationArguments[key])
  }

  parse() {
    return blameParser(this.responseText).parse()
  }

  emptyResult() {
    return []
  }
}

export const gitBlame = (args: GitBlameArguments) => {
  return new GitBlame(args)
}
