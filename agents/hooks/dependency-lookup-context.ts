#!/usr/bin/env -S deno run --allow-env --allow-read
// UserPromptSubmit hook: injects dependency-lookup routing context when the
// prompt touches exotui, Deno runtime, or @std APIs. Silence means no-op.

const depPattern =
  /exotui|@ubernaut|@std\/|jsr:|deno|TextBox|LogViewer|TerminalApp|\bSignal\b|\bComputed\b|\bTUI\b/i

const context = [
  'Dependency APIs are indexed locally — verify signatures, never write' +
  ' exotui/Deno code from memory.',
  'codebase-memory-mcp projects: "exotui" (@ubernaut/exotui source), "deno"' +
  ' (Deno.* runtime d.ts), "deno-std" (@std/*),' +
  ' "Users-kane-Projects-rho-crow-code" (this repo).',
  'Pick the project from the import specifier: @ubernaut/exotui/* → exotui,' +
  ' @std/* → deno-std, Deno.* → deno.',
  'Query order: search_graph(project, name_pattern) or semantic_query for' +
  ' discovery → get_code_snippet(qualified_name) for source → trace_path' +
  ' for callers.',
  'Fallback: read/grep .deps/{exotui,deno,std} (gitignored but readable),' +
  ' then JSR/raw GitHub curl. See AGENTS.md "Dependency lookup" and the' +
  ' dependency-lookup skill.',
].join('\n')

const readPayload = async () => {
  const text = await new Response(Deno.stdin.readable).text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// deno-lint-ignore no-explicit-any
const extractPrompt = (payload: any) => {
  if (payload === null || typeof payload !== 'object') return null
  if (typeof payload.prompt !== 'string') return null
  return payload.prompt
}

const main = async () => {
  const prompt = extractPrompt(await readPayload())
  if (prompt === null || !depPattern.test(prompt)) return
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: context,
    },
  }))
}

await main()
