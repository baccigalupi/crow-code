import { describe, expect, it } from 'bun:test'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { PromptNavigation } from '../../../../src/tui/install/interactions/prompt-navigation.ts'
import { useSignalValue } from '../../../../src/tui/install/interactions/use-signal-value.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('PromptNavigation', () => {
  it('when goTo is called, the new panel is rendered before it returns', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    const rendered: string[] = []
    const Current = () => {
      rendered.push(useSignalValue(store.navigator.current))
      return <text>x</text>
    }
    const { renderer } = await testRender(<Current />, {
      width: 10,
      height: 1,
    })

    act(() => new PromptNavigation(store).goTo('envFile'))

    expect(rendered).toEqual(['repo', 'envFile'])
    act(() => renderer.destroy())
  })

  it('when exit is called, the store asks to quit', () => {
    const store = new DataStore({ applicationData: mockApplicationData() })

    new PromptNavigation(store).exit()

    expect(store.quit.requested.peek()).toBe(true)
  })
})
