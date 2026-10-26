/** @jsxImportSource @opentui/react */
import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { useUserInputState } from '../../../../../src/tui/install/interactions/hooks/use-user-input-state.ts'
import { emptyText, insertText } from '../../../../../src/tui/input-text.ts'
import type { UserInputData } from '../../../../../src/tui/install/types.ts'
import { buildUserInputStore } from '../../../../support/user-input-store.ts'

describe('useUserInputState', () => {
  it('when rendered, returns the current value of every install signal', async () => {
    const userInputStore = buildUserInputStore()
    userInputStore.repoDirectory.value = insertText(emptyText(), './lib')
    userInputStore.step.value = 'envFile'
    userInputStore.confirmation.value = false
    const result: { current: UserInputData | null } = { current: null }
    const Reader = () => {
      result.current = useUserInputState(userInputStore)
      return <text>reader</text>
    }

    const { renderer } = await testRender(<Reader />, { width: 10, height: 1 })

    expect(result.current).toMatchObject({
      repoDirectory: { text: './lib' },
      globalDirectory: { text: '' },
      step: 'envFile',
      confirmation: false,
    })
    renderer.destroy()
  })

  it('when any signal changes, re-renders with the new values', async () => {
    const userInputStore = buildUserInputStore()
    const result: { current: UserInputData | null } = { current: null }
    const Reader = () => {
      result.current = useUserInputState(userInputStore)
      return <text>reader</text>
    }
    const { renderer, renderOnce } = await testRender(<Reader />, {
      width: 10,
      height: 1,
    })

    userInputStore.allowedLocalScripts.value = insertText(
      emptyText(),
      './build.sh',
    )
    userInputStore.step.value = 'confirm'
    await renderOnce()

    expect(result.current).toMatchObject({
      allowedLocalScripts: { text: './build.sh' },
      step: 'confirm',
    })
    renderer.destroy()
  })
})
