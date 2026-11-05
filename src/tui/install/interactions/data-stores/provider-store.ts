import { computed, signal, type ReadonlySignal } from '@preact/signals-core'
import type { EnvBuffer, InstallProvider } from '../../types.ts'

// The providers committed so far, and their credentials held for the .env
// file rather than the config.
export class ProviderStore {
  private saved = signal<readonly InstallProvider[]>([])
  private buffered = signal<EnvBuffer>({})
  readonly values = computed(() => ({
    providers: this.saved.value,
    envBuffer: this.buffered.value,
  }))

  get providers(): ReadonlySignal<readonly InstallProvider[]> {
    return this.saved
  }

  get envBuffer(): ReadonlySignal<EnvBuffer> {
    return this.buffered
  }

  save(provider: InstallProvider, credential: string) {
    this.saved.value = [...this.saved.peek(), provider]
    this.bufferCredential(provider.name, credential)
  }

  private bufferCredential(name: string, credential: string) {
    if (credential.length === 0) return
    const variable = this.envVar(name)
    this.buffered.value = { ...this.buffered.peek(), [variable]: credential }
  }

  // The env var holding a provider's credential is derived from its name, so
  // config never stores it: `Open Router` -> `OPEN_ROUTER_API_KEY`.
  private envVar(name: string) {
    const snake = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    return `${snake}_API_KEY`
  }
}
