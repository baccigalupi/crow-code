#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
// Flags guard clauses whose returned call resolves to void or Promise<void>.
// Usage: void-guard-calls.ts <file> [<file>...]
//
// Candidates are collected by `deno lint --json` with the collector plugin,
// then each callee is resolved through `deno lsp` hover. Returning a
// void-returning call hides a side effect inside the return statement.

import { relative } from '@std/path'
import { LanguageServer } from '../editor/language-server-client.ts'
import {
  candidatesByFile,
  type GuardCallCandidate,
  lintFilePath,
  returnTypeIsVoid,
} from './void-guard-calls-analysis.ts'

const pollMilliseconds = 100
const startupMilliseconds = 60000
const collectionMilliseconds = 120000
const hoverMilliseconds = 15000
const collectorConfig = 'agents/style-checks/void-guard-calls.deno.json'

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const waitFor = async (
  condition: () => boolean,
  timeoutMilliseconds: number,
) => {
  const deadline = Date.now() + timeoutMilliseconds
  while (true) {
    if (condition()) {
      return true
    }
    if (Date.now() > deadline) {
      return false
    }
    await sleep(pollMilliseconds)
  }
}

type Target = { file: string; candidates: GuardCallCandidate[] }

const collect = async (files: string[]): Promise<Target[]> => {
  const command = new Deno.Command('deno', {
    args: ['lint', '--json', '--config', collectorConfig, ...files],
    stdout: 'piped',
    stderr: 'piped',
  })
  const output = await command.output()
  const json = new TextDecoder().decode(output.stdout)
  const targets: Target[] = []
  for (const [filename, candidates] of candidatesByFile(json)) {
    targets.push({ file: lintFilePath(filename), candidates })
  }
  return targets
}

const markedStringText = (part: unknown): string => {
  if (typeof part === 'string') return part
  if (part === null || typeof part !== 'object') return ''
  const value = (part as { value?: unknown }).value
  return typeof value === 'string' ? value : ''
}

const hoverText = (hover: unknown): string => {
  if (hover === null || typeof hover !== 'object') return ''
  const contents = (hover as { contents?: unknown }).contents
  if (Array.isArray(contents)) return contents.map(markedStringText).join('\n')
  return markedStringText(contents)
}

const startServer = () => {
  const command = new Deno.Command('deno', {
    args: ['lsp'],
    stdin: 'piped',
    stdout: 'piped',
  })
  return new LanguageServer(command.spawn())
}

const hoverOrNull = async (
  server: LanguageServer,
  file: string,
  candidate: GuardCallCandidate,
) => {
  return await Promise.race([
    server.hover(file, candidate.line, candidate.character),
    sleep(hoverMilliseconds).then(() => null),
  ])
}

const check = async (server: LanguageServer, target: Target) => {
  let violations = 0
  for (const candidate of target.candidates) {
    const hover = await hoverOrNull(server, target.file, candidate)
    if (!returnTypeIsVoid(hoverText(hover))) continue
    console.log(
      `${relative(Deno.cwd(), target.file)}:${candidate.line + 1}:${
        candidate.character + 1
      }: guard clause return resolves to void/Promise<void>; ` +
        'call the function, then return',
    )
    violations += 1
  }
  return violations
}

const main = async () => {
  if (Deno.args.length === 0) Deno.exit(0)
  const targets = await collect(Deno.args)
  if (targets.length === 0) Deno.exit(0)
  const server = startServer()
  const listening = server.listen()
  await server.start()
  if (!(await waitFor(() => server.ready, startupMilliseconds))) {
    console.error('deno lsp never answered initialize')
    server.stop()
    Deno.exit(2)
  }
  await server.announceInitialized()
  for (const target of targets) {
    await server.openDocument(target.file)
  }
  await waitFor(
    () => server.receivedCount >= targets.length,
    collectionMilliseconds,
  )
  let violations = 0
  for (const target of targets) {
    violations += await check(server, target)
  }
  server.stop()
  await listening
  Deno.exit(violations === 0 ? 0 : 1)
}

await main()
