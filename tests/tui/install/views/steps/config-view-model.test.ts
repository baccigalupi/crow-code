import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { configViewModel } from '../../../../../src/tui/install/views/steps/config-view-model.ts'
import { emptyBuffer } from '../../../../../src/tui/input-buffer.ts'

describe('configViewModel', () => {
  it('when the step is crowGlobalDirectory, highlights the crowGlobalDirectory line', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const viewModel = configViewModel({
      step: 'crowGlobalDirectory',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.before).toBe('{\n  ')
    expect(viewModel.highlighted).toBe('"crowGlobalDirectory": "~/.crow",')
  })

  it('when the step is envFile, highlights the envFile line', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const viewModel = configViewModel({
      step: 'envFile',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.highlighted).toBe('"envFile": "~/.crow/.env",')
  })

  it('when the step is additionalRead, highlights the additionalRead line', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const viewModel = configViewModel({
      step: 'additionalRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.highlighted).toBe('"additionalRead": [],')
  })

  it('when the step is escalateRead, highlights the escalateRead line', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const viewModel = configViewModel({
      step: 'escalateRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.highlighted).toBe('"escalateRead": [],')
  })

  it('when the step is escalateWrite, highlights the whole escalateWrite array', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()

    const viewModel = configViewModel({
      step: 'escalateWrite',
      repoDirectory,
      globalDirectory,
      envFile: emptyBuffer(),
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.highlighted).toBe(
      '"escalateWrite": [\n      "./dev",\n      "./agent"\n    ],',
    )
  })

  it('when the step is confirm, highlights nothing', () => {
    const repoDirectory = emptyBuffer()
    const globalDirectory = emptyBuffer()
    const envFile = emptyBuffer()

    const viewModel = configViewModel({
      step: 'confirm',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyBuffer(),
      additionalRead: emptyBuffer(),
      escalateWrite: emptyBuffer(),
      allowedLocalScripts: emptyBuffer(),
    })

    expect(viewModel.highlighted).toBe('')
    expect(viewModel.after).toBe('')
  })
})
