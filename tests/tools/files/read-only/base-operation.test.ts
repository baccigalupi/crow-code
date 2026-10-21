import { describe, expect, it } from 'bun:test'
import { ReadOnlyFileOperation } from '../../../../src/tools/files/read-only/base-operation.ts'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ReadOnlyFileOperation', () => {
  it('when the path is in a configured read directory outside the working directory, allows it', async () => {
    class AllowedPath extends ReadOnlyFileOperation<{ path: string }, string> {
      protected logPrefix = 'allowed path: '
      private allowedPath = ''
      result() {
        return this.allowedPath
      }
      protected perform() {
        this.allowedPath = this.operationArguments.path
        return Promise.resolve()
      }
    }
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [],
          additionalRead: ['../outside-read'],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const operation = new AllowedPath({
      applicationData,
      operationArguments: { path: '../outside-read/a.txt' },
    })
    await operation.run()

    expect(operation.result()).toBe('../outside-read/a.txt')
  })
})
