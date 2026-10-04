import type { TerminalApp } from '@ubernaut/exotui/app'

export type ReplAction = { type: 'app.quit' }
export type App = TerminalApp<ReplAction>
