import { describe, it } from 'node:test'
import { join } from '@std/path'
import { expect } from '@std/expect'
import { buildCrowConfig } from '../../../../src/tui/install/crow-config/build.ts'
import { writeCrowConfig } from '../../../../src/tui/install/crow-config/write.ts'
import { emptyBuffer, insertText } from '../../../../src/tui/input-buffer.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('write', () => {
  it('when written, saves the json to the repo config path', async () => {
    const directory = join(fixturesDirectory, 'write-crow-config', 'crow')
    await clearDirectory(directory)

    writeCrowConfig(
      buildCrowConfig({
        repoDirectory: insertText(emptyBuffer(), directory),
        globalDirectory: emptyBuffer(),
        envFile: emptyBuffer(),
      }).all(),
    )

    const written = Deno.readTextFileSync(join(directory, 'config.json'))
    expect(JSON.parse(written).crowGlobalDirectory).toBe('~/.crow')
    expect(JSON.parse(written).envFile).toBe('~/.crow/.env')
    await clearDirectory(directory)
  })
})
