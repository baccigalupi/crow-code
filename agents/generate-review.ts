#!/usr/bin/env -S deno run --allow-run --allow-write --allow-read
// Summarize the current working-tree diff into docs/review.md.

import { resolve } from '@std/path'

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

type Change = { path: string; isNew: boolean; line: number }

class ReviewGenerator {
  private root: string
  private targetRef: string

  constructor(root: string, targetRef: string) {
    this.root = root
    this.targetRef = targetRef
  }

  private async runGit(...args: string[]) {
    const result = await new Deno.Command('git', {
      args,
      stdout: 'piped',
      stderr: 'piped',
      cwd: this.root,
    }).output()
    if (!result.success) {
      console.error(decode(result.stderr))
      Deno.exit(1)
    }
    return decode(result.stdout)
  }

  private parseStatus(status: string) {
    if (status === '??' || status[0] === 'A') return 'new'
    if (status[0] === 'M' || status[1] === 'M') return 'modified'
    return 'other'
  }

  private parsePath(statusLine: string) {
    const parts = statusLine.slice(3).split(' -> ')
    return parts[parts.length - 1]
  }

  private async parentRef() {
    const output = await this.runGit(
      'log',
      '--pretty=%P',
      '-n1',
      this.targetRef,
    )
    const parents = output.trim().split(' ')
    if (parents.length === 0 || parents[0] === '') {
      return '4b825dc642cb6eb9a060e54bf8d69288fbee4904'
    }
    return parents[0]
  }

  private async diffRange() {
    if (this.targetRef === 'HEAD') {
      return ['HEAD']
    }
    const parent = await this.parentRef()
    return [parent, this.targetRef]
  }

  private async firstChangedLine(file: string) {
    const range = await this.diffRange()
    const diff = await this.runGit('diff', '-U0', ...range, '--', file)
    const match = diff.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (match === null) return 1
    return parseInt(match[1], 10)
  }

  private lineFor(file: string, isNew: boolean) {
    if (isNew) return Promise.resolve(1)
    return this.firstChangedLine(file)
  }

  private async changeFromStatusLine(line: string) {
    const status = line.slice(0, 2)
    const kind = this.parseStatus(status)
    if (kind === 'other') return null
    const file = this.parsePath(line)
    const isNew = kind === 'new'
    return { path: file, isNew, line: await this.lineFor(file, isNew) }
  }

  private parseDiffLine(line: string) {
    const parts = line.split('\t')
    return { status: parts[0], path: parts[parts.length - 1] }
  }

  private async changeFromDiffLine(line: string) {
    const parsed = this.parseDiffLine(line)
    const kind = this.parseStatus(parsed.status + ' ')
    if (kind === 'other') return null
    return {
      path: parsed.path,
      isNew: kind === 'new',
      line: await this.lineFor(parsed.path, kind === 'new'),
    }
  }

  private async collectStatusChanges(): Promise<Change[]> {
    const output = await this.runGit('status', '--porcelain=v1', '-u')
    const changes = await Promise.all(
      output.split('\n').filter((line) => line !== '').map((line) =>
        this.changeFromStatusLine(line)
      ),
    )
    return changes.filter((change): change is Change => change !== null)
  }

  private async collectDiffChanges(): Promise<Change[]> {
    const range = await this.diffRange()
    const output = await this.runGit('diff', '--name-status', ...range)
    const changes = await Promise.all(
      output.split('\n').filter((line) => line !== '').map((line) =>
        this.changeFromDiffLine(line)
      ),
    )
    return changes.filter((change): change is Change => change !== null)
  }

  private collectChanges(): Promise<Change[]> {
    if (this.targetRef === 'HEAD') {
      return this.collectStatusChanges()
    }
    return this.collectDiffChanges()
  }

  private markdownLink(change: Change) {
    return `- [${change.path}](/${change.path}#L${change.line})`
  }

  private subSection(title: string, changes: Change[]) {
    const lines = [`- ${title}`]
    if (changes.length === 0) {
      lines.push('  - _none_')
    } else {
      for (const change of changes) lines.push(`  ${this.markdownLink(change)}`)
    }
    return lines.join('\n')
  }

  private section(title: string, changes: Change[]) {
    const newFiles = changes.filter((change) => change.isNew)
    const updates = changes.filter((change) => !change.isNew)
    return [
      `${title}:\n`,
      this.subSection('new files', newFiles),
      this.subSection('updates', updates),
    ].join('\n')
  }

  private isRelevant(change: Change) {
    return change.path.startsWith('bin/') ||
      change.path.startsWith('src/') ||
      change.path.startsWith('tests/')
  }

  async generate() {
    const changes = (await this.collectChanges()).filter((change) =>
      this.isRelevant(change)
    )
    const sourceChanges = changes.filter((change) =>
      !change.path.startsWith('tests/')
    )
    const testChanges = changes.filter((change) =>
      change.path.startsWith('tests/')
    )
    const sections: string[] = []
    if (sourceChanges.length > 0) {
      sections.push(this.section('Source', sourceChanges))
    }
    if (testChanges.length > 0) {
      sections.push(this.section('Tests', testChanges))
    }
    await Deno.writeTextFile(
      resolve(this.root, 'docs/review.md'),
      sections.join('\n\n') + '\n',
    )
  }
}

const main = async () => {
  const result = await new Deno.Command('git', {
    args: ['rev-parse', '--show-toplevel'],
    stdout: 'piped',
  }).output()
  const root = decode(result.stdout).trim()
  const targetRef = Deno.args.length === 0 ? 'HEAD' : Deno.args[0]
  await new ReviewGenerator(root, targetRef).generate()
}

await main()
