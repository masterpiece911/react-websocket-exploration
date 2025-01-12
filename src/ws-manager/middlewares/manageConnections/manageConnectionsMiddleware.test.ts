import { vi } from 'vitest'
import manageConnectionsMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import WebsocketMock from '../__mocks__/WebSocket.mock'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
  WebSocketManagerConnections,
  WebSocketManagerListeners,
  WebSocketStatus,
} from '../../types'

describe('manage connections middleware', () => {
  beforeEach(() => {
    vi.stubGlobal('WebSocket', WebsocketMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.only('should reestablish websocket connection if the connection is closed outside the manageConnections middleware', () => {
    const connections: WebSocketManagerConnections = new Map()
    const listeners: WebSocketManagerListeners = new Map()
    const listenersForA = new Set<{
      (status: WebSocketStatus<WebSocketDataMap['ws://localhost:8080/A']>): void
    }>()
    // manageConnections middleware does not reconnect if no listener exists
    listenersForA.add(vi.fn())
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({
      initialConnections: connections,
      initialListeners: listeners,
    })

    const listenerCallback = vi.fn()

    const establishConnectionAction: WebSocketManagerAction<'ws://localhost:8080/A'> =
      {
        type: 'SUBSCRIBE',
        payload: {
          source: 'ws://localhost:8080/A',
          callback: listenerCallback,
        },
      }

    const nextMiddlewareInChain = vi.fn()

    // establish ws connection through manageConnections middleware to get auto-reconnect behavior
    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(
      establishConnectionAction,
    )

    expect(connections.get('ws://localhost:8080/A')).toBeDefined()

    vi.useFakeTimers()

    manager.setConnection.mockClear()

    const sourceAWebsocketConnection = connections.get('ws://localhost:8080/A')
    console.log('calling ws close')
    sourceAWebsocketConnection?.close()

    vi.advanceTimersByTime(5000)

    console.log('about to assert')
    expect(manager.setConnection).toHaveBeenCalled()
    expect(connections.get('ws://localhost:8080/A')).toBeDefined()

    vi.useRealTimers()
  })

  it('should call deleteConnection when receiving an UNSUBSCRIBE event and the amount of listeners is 0', () => {
    const connections: WebSocketManagerConnections = new Map()
    const listeners: WebSocketManagerListeners = new Map()
    const listenersForA: Set<{
      (status: WebSocketStatus<WebSocketDataMap['ws://localhost:8080/A']>): void
    }> = new Set()
    connections.set(
      'ws://localhost:8080/A',
      new WebSocket('ws://localhost:8080/A'),
    )
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({
      initialConnections: connections,
      initialListeners: listeners,
    })

    const originalAction: WebSocketManagerAction<'ws://localhost:8080/A'> = {
      type: 'UNSUBSCRIBE',
      payload: {
        source: 'ws://localhost:8080/A',
        callback: vi.fn(),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(manager.deleteConnection).toHaveBeenCalled()
  })
  it('should not call deleteConnection when receiving an UNSUBSCRIBE event but at least one listener remains', () => {
    const connections: WebSocketManagerConnections = new Map()
    const listeners: WebSocketManagerListeners = new Map()
    const listenersForA: Set<{
      (status: WebSocketStatus<WebSocketDataMap['ws://localhost:8080/A']>): void
    }> = new Set()
    listenersForA.add(vi.fn())
    connections.set(
      'ws://localhost:8080/A',
      new WebSocket('ws://localhost:8080/A'),
    )
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({
      initialConnections: connections,
      initialListeners: listeners,
    })

    const originalAction: WebSocketManagerAction<'ws://localhost:8080/A'> = {
      type: 'UNSUBSCRIBE',
      payload: {
        source: 'ws://localhost:8080/A',
        callback: vi.fn(),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(manager.deleteConnection).not.toHaveBeenCalled()
  })
  it('should call setConnection when receiving a SUBSCRIBE event and no connection exists', () => {
    const connections: WebSocketManagerConnections = new Map()
    const listeners: WebSocketManagerListeners = new Map()
    const listenersForA: Set<{
      (status: WebSocketStatus<WebSocketDataMap['ws://localhost:8080/A']>): void
    }> = new Set()
    listenersForA.add(vi.fn())
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({
      initialConnections: connections,
      initialListeners: listeners,
    })

    const originalAction: WebSocketManagerAction<'ws://localhost:8080/A'> = {
      type: 'SUBSCRIBE',
      payload: {
        source: 'ws://localhost:8080/A',
        callback: vi.fn(),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(manager.setConnection).toHaveBeenCalled()
  })
  it('should not call setConnection when receiving a SUBSCRIBE event but a connection is already established', () => {
    const connections: WebSocketManagerConnections = new Map()
    const listeners: WebSocketManagerListeners = new Map()
    const listenersForA: Set<{
      (status: WebSocketStatus<WebSocketDataMap['ws://localhost:8080/A']>): void
    }> = new Set()
    listenersForA.add(vi.fn())
    connections.set(
      'ws://localhost:8080/A',
      new WebSocket('ws://localhost:8080/A'),
    )
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({
      initialConnections: connections,
      initialListeners: listeners,
    })

    const originalAction: WebSocketManagerAction<'ws://localhost:8080/A'> = {
      type: 'SUBSCRIBE',
      payload: {
        source: 'ws://localhost:8080/A',
        callback: vi.fn(),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(manager.setConnection).not.toHaveBeenCalled()
  })
  it('should pass action type DATA_RECEIVED without any modification', () => {
    const manager = createWebSocketManagerMock()

    const nextMiddlewareInChain = vi.fn()

    const originalAction: WebSocketManagerAction<WebSocketDataSource> = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'INVALID',
        raw: 'not relevant',
        reason: 'Some middleware rejection',
      },
    }

    manageConnectionsMiddleware(manager)(nextMiddlewareInChain)(originalAction)
    expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
  })
})
