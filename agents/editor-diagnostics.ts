// Prints the diagnostics the VS Code Deno extension shows for the given roots.
// Usage: deno run --allow-run --allow-read --allow-env agents/editor-diagnostics.ts src bin tests

import { relative, resolve } from '@std/path'
import { type Diagnostic, LanguageServer } from './language-server-client.ts'

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

const label = (diagnostic: Diagnostic) => {
  const { line, character } = diagnostic.range.start
  let source = 'deno'
  if (diagnostic.source !== undefined) {
    source = diagnostic.source
  }
  let code = 'n/a'
  if (diagnostic.code !== undefined) {
    code = `${diagnostic.code}`
  }
  return `${source}(${code}) at ${line + 1}:${character + 1}`
}

const report = (server: LanguageServer, files: string[]) => {
  let total = 0
  for (const file of files) {
    for (const diagnostic of server.diagnosticsFor(file)) {
      console.log(
        `${relative(Deno.cwd(), file)}: ${
          label(diagnostic)
        }: ${diagnostic.message}`,
      )
      total += 1
    }
  }
  console.log(`\n${files.length} files, ${total} diagnostics`)
  return total
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
  const total = report(server, files)
  server.stop()
  await listening
  Deno.exit(total === 0 ? 0 : 1)
}

await main()
