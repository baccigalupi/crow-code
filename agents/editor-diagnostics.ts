#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
// Prints the diagnostics the VS Code Deno extension shows for the given roots.
// Usage: agents/editor-diagnostics.ts src bin tests

import { relative, resolve } from '@std/path'
import {
  type Diagnostic,
  LanguageServer,
} from './editor/language-server-client.ts'

const pollMilliseconds = 100
const startupMilliseconds = 60000
const collectionMilliseconds = 120000

const collectTypescriptFiles = async (root: string, files: string[]) => {
  for await (const entry of Deno.readDir(root)) {
    const path = resolve(root, entry.name)
    if (entry.isDirectory) {
      await collectTypescriptFiles(path, files)
    }
    if (entry.isFile && entry.name.endsWith('.ts')) {
      files.push(path)
    }
  }
  return files
}

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

const severityNames = ['error', 'warning', 'information', 'hint']
const deprecatedTag = 2

const severityName = (diagnostic: Diagnostic) => {
  if (diagnostic.severity === undefined) {
    return 'error'
  }
  return severityNames[diagnostic.severity - 1]
}

const isBlocking = (diagnostic: Diagnostic) => {
  if (diagnostic.severity === undefined) {
    return true
  }
  return diagnostic.severity <= 2
}

const isDeprecated = (diagnostic: Diagnostic) => {
  if (diagnostic.tags === undefined) {
    return false
  }
  return diagnostic.tags.includes(deprecatedTag)
}

const describe = (diagnostic: Diagnostic) => {
  const { line, character } = diagnostic.range.start
  let source = 'deno'
  if (diagnostic.source !== undefined) {
    source = diagnostic.source
  }
  let code = 'n/a'
  if (diagnostic.code !== undefined) {
    code = `${diagnostic.code}`
  }
  let deprecated = ''
  if (isDeprecated(diagnostic)) {
    deprecated = ' (deprecated)'
  }
  return `${severityName(diagnostic)}${deprecated} ${source}(${code}) at ${
    line + 1
  }:${character + 1}`
}

const report = (server: LanguageServer, files: string[]) => {
  let total = 0
  let blocking = 0
  for (const file of files) {
    for (const diagnostic of server.diagnosticsFor(file)) {
      console.log(
        `${relative(Deno.cwd(), file)}: ${
          describe(diagnostic)
        }: ${diagnostic.message}`,
      )
      total += 1
      if (isBlocking(diagnostic)) {
        blocking += 1
      }
    }
  }
  console.log(
    `\n${files.length} files, ${total} diagnostics, ${blocking} errors or warnings`,
  )
  return blocking
}

const startServer = () => {
  const command = new Deno.Command('deno', {
    args: ['lsp'],
    stdin: 'piped',
    stdout: 'piped',
  })
  return new LanguageServer(command.spawn())
}

const main = async () => {
  const roots = Deno.args.map((root) => resolve(Deno.cwd(), root))
  const collected = await Promise.all(
    roots.map((root) => collectTypescriptFiles(root, [])),
  )
  const files = collected.flat().sort()
  const server = startServer()
  const listening = server.listen()
  await server.start()
  if (!(await waitFor(() => server.ready, startupMilliseconds))) {
    console.error('deno lsp never answered initialize')
    server.stop()
    Deno.exit(2)
  }
  await server.announceInitialized()
  for (const file of files) {
    await server.openDocument(file)
  }
  await waitFor(
    () => server.receivedCount >= files.length,
    collectionMilliseconds,
  )
  await sleep(pollMilliseconds)
  const blocking = report(server, files)
  server.stop()
  await listening
  Deno.exit(blocking === 0 ? 0 : 1)
}

await main()
