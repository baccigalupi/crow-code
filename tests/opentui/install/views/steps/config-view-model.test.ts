import { describe, expect, it } from 'bun:test'
import { configViewModel } from '../../../../../src/opentui/install/views/steps/config-view-model.ts'
import { emptyText } from '../../../../../src/opentui/input-text.ts'

describe('configViewModel', () => {
  it('when the step is crowGlobalDirectory, highlights the crowGlobalDirectory line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'crowGlobalDirectory',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.before).toBe('{\n  ')
    expect(viewModel.highlighted).toBe('"crowGlobalDirectory": "~/.crow",')
  })

  it('when the step is envFile, highlights the envFile line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'envFile',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.highlighted).toBe('"envFile": "~/.crow/.env",')
  })

  it('when the step is additionalRead, highlights the additionalRead line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'additionalRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.highlighted).toBe('"additionalRead": [],')
  })

  it('when the step is escalateRead, highlights the escalateRead line', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'escalateRead',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.highlighted).toBe('"escalateRead": [],')
  })

  it('when the step is escalateWrite, highlights the whole escalateWrite array', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()

    const viewModel = configViewModel({
      step: 'escalateWrite',
      repoDirectory,
      globalDirectory,
      envFile: emptyText(),
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.highlighted).toBe(
      '"escalateWrite": [\n      "./dev",\n      "./agent"\n    ],',
    )
  })

  it('when the step is confirm, highlights nothing', () => {
    const repoDirectory = emptyText()
    const globalDirectory = emptyText()
    const envFile = emptyText()

    const viewModel = configViewModel({
      step: 'confirm',
      repoDirectory,
      globalDirectory,
      envFile,
      escalateRead: emptyText(),
      additionalRead: emptyText(),
      escalateWrite: emptyText(),
      allowedLocalScripts: emptyText(),
    })

    expect(viewModel.highlighted).toBe('')
    expect(viewModel.after).toBe('')
  })
})
