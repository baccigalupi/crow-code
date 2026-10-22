import type { CliRenderer, createCliRenderer } from '@opentui/core'

export type CreateRenderer = typeof createCliRenderer

export type Teardown = Pick<CliRenderer, 'destroy' | 'closed'>

export interface ReplIo {
  stdin?: NodeJS.ReadStream
  stdout?: NodeJS.WriteStream
}
