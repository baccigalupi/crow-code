#!/usr/bin/env -S deno run --allow-run --allow-write --allow-read
// Summarize the current working-tree diff into docs/review.md.

import { resolve } from '@std/path'

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

type Change = { path: string; isNew: boolean; line: number }

class ReviewGenerator {
  private root: string

  constructor(root: string) {
    this.root = root
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

  private async firstChangedLine(file: string) {
    const diff = await this.runGit('diff', '-U0', 'HEAD', '--', file)
    const match = diff.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
    if (match === null) return 1
    return parseInt(match[1], 10)
  }

  private lineFor(file: string, isNew: boolean) {
    if (isNew) return Promise.resolve(1)
    return this.firstChangedLine(file)
  }

  private async collectChanges(): Promise<Change[]> {
    const output = await this.runGit('status', '--porcelain=v1', '-u')
    const changes: Change[] = []
    for (const line of output.split('\n').filter((line) => line !== '')) {
      const status = line.slice(0, 2)
      const kind = this.parseStatus(status)
      if (kind === 'other') continue
      const file = this.parsePath(line)
      const isNew = kind === 'new'
      changes.push({ path: file, isNew, line: await this.lineFor(file, isNew) })
    }
    return changes
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
  await new ReviewGenerator(root).generate()
}

await main()
