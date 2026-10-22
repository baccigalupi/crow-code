import { createCliRenderer, type CliRenderer } from '@opentui/core'
import { createRoot } from '@opentui/react'
import { createElement, type FunctionComponent } from 'react'
import type { ApplicationData } from '../application-data/application-data.ts'
import { memoize } from '../decorators.ts'
import { ProcessSignalListeners } from './runner/process-signal-listeners.ts'
import { RendererLifecycle } from './runner/renderer-lifecycle.ts'
import { tuiRendererConfig } from './runner/tui-renderer-config.ts'
import type { CreateRenderer, ReplIo } from './runner/types.ts'

export class OpenTuiRunner {
  private applicationData: ApplicationData
  private io: ReplIo
  private view: FunctionComponent
  private createRenderer: CreateRenderer
  private lifecycle = new RendererLifecycle()
  readonly exit = this.lifecycle.exit
  readonly interrupt = this.lifecycle.interrupt

  constructor(
    applicationData: ApplicationData,
    io: ReplIo,
    view: FunctionComponent,
    createRenderer: CreateRenderer,
  ) {
    this.applicationData = applicationData
    this.io = io
    this.view = view
    this.createRenderer = createRenderer
  }

  @memoize
  private processSignalListeners() {
    return new ProcessSignalListeners(this.applicationData, this.interrupt)
  }

  async status() {
    this.processSignalListeners().listen()
    try {
      return await this.start()
    } finally {
      this.processSignalListeners().unlisten()
    }
  }

  private start() {
    if (this.io.stdin && !this.io.stdin.setRawMode) {
      return this.unsupportedTerminal()
    } else {
      return this.attempt()
    }
  }

  private unsupportedTerminal() {
    return this.failed(
      new Error(
        'Crow unable to work in this terminal - TTY compatible stdin required.',
      ),
    )
  }

  private attempt() {
    return this.run().catch((error: Error) => this.failed(error))
  }

  private async run() {
    const renderer = await this.createRenderer(tuiRendererConfig(this.io))
    this.mount(renderer)
    await renderer.idle()
    await renderer.closed
    return this.lifecycle.status()
  }

  private mount(renderer: CliRenderer) {
    this.lifecycle.attach(renderer)
    createRoot(renderer).render(createElement(this.view))
  }

  private async failed(error: Error) {
    await this.lifecycle.close()
    this.applicationData.consoleError()(String(error))
    return 'interrupted' as const
  }
}

const placeholderView = () => createElement('text', null, 'crow')

export const createOpenTuiRunner = (
  applicationData: ApplicationData,
  io: ReplIo,
  view: FunctionComponent = placeholderView,
  createRenderer: CreateRenderer = createCliRenderer,
) => new OpenTuiRunner(applicationData, io, view, createRenderer)
