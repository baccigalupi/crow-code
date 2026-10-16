import { render } from 'ink-testing-library'

// renderHook for Ink: mounts the hook inside an Ink render so hooks that
// read Ink context (useInput, useStdin, useApp) get a stdin to listen to.
// Ink mounts synchronously, so a key written to `stdin` is handled before
// `write` returns; no waiting is needed.
export const renderHook = <Result,>(callback: () => Result) => {
  const result = { current: undefined as Result }
  const HookHost = () => {
    result.current = callback()
    return null
  }
  return { result, ...render(<HookHost />) }
}
