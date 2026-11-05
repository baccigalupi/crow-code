import { describe, expect, it, mock } from 'bun:test'
import { TextAttributes } from '@opentui/core'
import { testRender } from '@opentui/react/test-utils'
import { act } from 'react'
import { DataStore } from '../../../../src/tui/install/data-store.ts'
import { ProviderActions } from '../../../../src/tui/install/provider/actions.ts'
import { Field } from '../../../../src/tui/install/provider/field.tsx'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('Field', () => {
  it('when its step has passed, shows the answer', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providerEditForm.providerName.insert('nous')
    store.navigator.goTo('providerUrl')
    const actions = new ProviderActions({
      step: 'providerUrl',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Field store={store} name="providerName" actions={actions} />,
      { width: 40, height: 1 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('Name: nous')
    act(() => renderer.destroy())
  })

  it('when live, its input types into its field', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerUrl')
    const actions = new ProviderActions({
      step: 'providerUrl',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, mockInput } = await testRender(
      <Field store={store} name="providerUrl" actions={actions} />,
      { width: 40, height: 1 },
    )

    await act(() => mockInput.typeText('x'))

    expect(store.providerEditForm.providerUrl.text.peek().text).toBe('x')
    act(() => renderer.destroy())
  })

  it('when the API key is live, draws it as dots', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.providerEditForm.providerCredentials.insert('sk-1')
    store.navigator.goTo('providerCredentials')
    const actions = new ProviderActions({
      step: 'providerUrl',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, renderOnce, captureCharFrame } = await testRender(
      <Field store={store} name="providerCredentials" actions={actions} />,
      { width: 40, height: 1 },
    )

    await renderOnce()

    expect(captureCharFrame()).toContain('API key: ••••')
    expect(captureCharFrame()).not.toContain('sk-1')
    act(() => renderer.destroy())
  })

  it('when the API key is live, typing goes into the key', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerCredentials')
    const actions = new ProviderActions({
      step: 'providerCredentials',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, mockInput } = await testRender(
      <Field store={store} name="providerCredentials" actions={actions} />,
      { width: 40, height: 1 },
    )

    await act(() => mockInput.typeText('sk'))

    expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
      'sk',
    )
    act(() => renderer.destroy())
  })

  it('when a key is pasted into the live API key, goes in without newlines', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerCredentials')
    const actions = new ProviderActions({
      step: 'providerCredentials',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, mockInput } = await testRender(
      <Field store={store} name="providerCredentials" actions={actions} />,
      { width: 40, height: 1 },
    )

    await act(() => mockInput.pasteBracketedText('sk-123\r\n'))

    expect(store.providerEditForm.providerCredentials.text.peek().text).toBe(
      'sk-123',
    )
    act(() => renderer.destroy())
  })

  it('when tab arrives on a live input, moves forward without typing it', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerUrl')
    const navigation = { goTo: mock(), exit: mock() }
    const actions = new ProviderActions({
      step: 'providerUrl',
      store,
      navigation,
    })
    const { renderer, mockInput } = await testRender(
      <Field store={store} name="providerUrl" actions={actions} />,
      { width: 40, height: 1 },
    )

    act(() => mockInput.pressTab())

    expect(navigation.goTo.mock.calls).toEqual([['providerCredentials']])
    expect(store.providerEditForm.providerUrl.text.peek().text).toBe('')
    act(() => renderer.destroy())
  })

  it('when its step is still to come, is a dim label', async () => {
    const store = new DataStore({ applicationData: mockApplicationData() })
    store.navigator.goTo('providerName')
    const actions = new ProviderActions({
      step: 'providerUrl',
      store,
      navigation: { goTo: mock(), exit: mock() },
    })
    const { renderer, renderOnce, captureSpans } = await testRender(
      <Field store={store} name="providerUrl" actions={actions} />,
      { width: 40, height: 1 },
    )

    await renderOnce()

    const { spans } = captureSpans().lines[0]
    expect(spans[1].text).toBe('Url:')
    expect(spans[1].attributes).toBe(TextAttributes.DIM)
    act(() => renderer.destroy())
  })
})
