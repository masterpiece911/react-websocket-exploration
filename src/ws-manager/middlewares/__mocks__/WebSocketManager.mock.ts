import { vi, Mock } from 'vitest'
import {
  WebSocketManagerAPI,
  WebSocketManagerData,
  WebSocketManagerConnections,
  WebSocketManagerListeners,
  WebSocketStatus,
  WebSocketDataSource,
} from '../../types'

export function createWebSocketManagerMock({
  initialConnections = new Map(),
  initialListeners = new Map(),
  initialLatestData = {},
}: {
  initialConnections?: WebSocketManagerConnections
  initialListeners?: WebSocketManagerListeners
  initialLatestData?: WebSocketManagerData
} = {}): WebSocketManagerAPI & {
  [K in keyof WebSocketManagerAPI]: Mock<WebSocketManagerAPI[K]>
} {
  // Internal state with configurable defaults
  const connections = initialConnections
  const listeners = initialListeners
  const latestData: WebSocketManagerData = { ...initialLatestData }

  return {
    onReceiveData: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    getListeners: vi.fn(
      (source) =>
        listeners.get(source) ||
        new Set<(status: WebSocketStatus<any>) => void>(),
    ),
    getConnection: vi.fn((source) => connections.get(source)),
    setConnection: vi.fn((source, connection) => {
      connections.set(source, connection)
    }),
    deleteConnection: vi.fn((source) => {
      connections.delete(source)
    }),
    getLatestData: vi.fn((source: WebSocketDataSource) => latestData[source]),
    __getAllLatestData: vi.fn(() => ({ ...latestData })),
    setLatestData: vi.fn((source: WebSocketDataSource, data) => {
      latestData[source] = data
    }),
    purgeLatestData: vi.fn((source: WebSocketDataSource) => {
      delete latestData[source]
    }),
  }
}
