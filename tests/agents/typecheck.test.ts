import { describe, expect, it } from 'bun:test'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('agents/typecheck', () => {
  it('reports a type error', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'typecheck-'))
    const config = join(dir, 'tsconfig.json')
    await writeFile(
      config,
      JSON.stringify({
        compilerOptions: { strict: true, noEmit: true },
        include: ['bad.ts'],
      }),
    )
    await writeFile(
      join(dir, 'bad.ts'),
      "const n: number = 'x'\nexport { n }\n",
    )

    const child = Bun.spawn(['agents/typecheck', '-p', config], {
      stdout: 'pipe',
    })
    const stdout = await new Response(child.stdout).text()

    expect(await child.exited).toBe(2)
    expect(stdout).toContain('TS2322')
  })

  it('passes a clean project', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'typecheck-'))
    const config = join(dir, 'tsconfig.json')
    await writeFile(
      config,
      JSON.stringify({
        compilerOptions: { strict: true, noEmit: true },
        include: ['good.ts'],
      }),
    )
    await writeFile(join(dir, 'good.ts'), 'const n: number = 1\nexport { n }\n')

    const child = Bun.spawn(['agents/typecheck', '-p', config])

    expect(await child.exited).toBe(0)
  })

  it('repo tsconfig includes agents and .claude', async () => {
    const file = Bun.file('tsconfig.json')

    const text = await file.text()

    expect(JSON.parse(text).include).toEqual([
      'src',
      'bin',
      'tests',
      'agents',
      '.claude',
    ])
  })

  it('repo typechecks', async () => {
    const command = ['agents/typecheck']

    const child = Bun.spawn(command)

    expect(await child.exited).toBe(0)
  })
})
