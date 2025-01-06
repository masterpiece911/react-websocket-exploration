import { WebSocketDataSource } from '../ws-manager/types'

export const INITIAL_VALUE: WebSocketDataSource[] = ['ws://localhost:8080/A']
export const VALID_SOURCES: WebSocketDataSource[] = [
  'ws://localhost:8080/A',
  'ws://localhost:8080/B',
  'ws://localhost:8080/C',
]

export const SECTION_BUTTONS = [
  {
    label: 'A',
    source: 'ws://localhost:8080/A',
  },
  {
    label: 'B',
    source: 'ws://localhost:8080/B',
  },
  {
    label: 'C',
    source: 'ws://localhost:8080/C',
  },
] as const
