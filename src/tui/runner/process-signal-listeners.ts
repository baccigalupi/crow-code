import type { ApplicationData } from '../../application-data/application-data.ts'
import type { ProcessSignal } from '../../types.ts'

export class ProcessSignalListeners {
  private applicationData: ApplicationData
  private handler: () => void
  private signals: ProcessSignal[] = ['SIGINT', 'SIGTERM']

  constructor(applicationData: ApplicationData, handler: () => void) {
    this.applicationData = applicationData
    this.handler = handler
  }

  listen() {
    const { runtime } = this.applicationData
    this.signals.forEach((signal) =>
      runtime.addSignalListener(signal, this.handler),
    )
  }

  unlisten() {
    const { runtime } = this.applicationData
    this.signals.forEach((signal) =>
      runtime.removeSignalListener(signal, this.handler),
    )
  }
}
