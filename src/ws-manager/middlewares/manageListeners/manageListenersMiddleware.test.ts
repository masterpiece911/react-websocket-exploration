import { vi } from 'vitest'
import manageListenersMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
  WebSocketManagerListeners,
  WebSocketStatus,
} from '../../types'

type ActionThatManageListenersAccepts = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'SUBSCRIBE' | 'UNSUBSCRIBE' }
>
type ActionThatManageListenersIgnores = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'DATA_RECEIVED' }
>

describe('manage listeners middleware', () => {
  it('should add provided callback to managerAPI listeners when receiving SUBSCRIBE event', () => {
    const listeners: WebSocketManagerListeners = new Map()
    listeners.set('ws://localhost:8080/A', new Set())
    const manager = createWebSocketManagerMock({ initialListeners: listeners })

    const callback = vi.fn()
    const source: WebSocketDataSource = 'ws://localhost:8080/A'

    const originalAction: ActionThatManageListenersAccepts = {
      type: 'SUBSCRIBE',
      payload: {
        source,
        callback,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageListenersMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(listeners.get('ws://localhost:8080/A')?.has(callback)).toBe(true)
  })

  it('should remove provided callback from managerAPI listeners when receiving UNSUBSCRIBE event', () => {
    const callback = vi.fn()
    const source: WebSocketDataSource = 'ws://localhost:8080/A'

    const listenersForA = new Set<{
      (status: WebSocketStatus<WebSocketDataMap[typeof source]>): void
    }>().add(callback)
    const listeners: WebSocketManagerListeners = new Map()
    listeners.set('ws://localhost:8080/A', listenersForA)
    const manager = createWebSocketManagerMock({ initialListeners: listeners })

    const originalAction: ActionThatManageListenersAccepts = {
      type: 'UNSUBSCRIBE',
      payload: {
        source,
        callback,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageListenersMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(listeners.get('ws://localhost:8080/A')?.has(callback)).toBe(false)
  })
  it('should pass action type DATA_RECEIVED without any modification', () => {
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatManageListenersIgnores = {
      type: 'DATA_RECEIVED',
      payload: {
        status: 'OK',
        data: { value: 1 },
        raw: JSON.stringify({ value: 1 }),
        source: 'ws://localhost:8080/A',
      },
    }

    const nextMiddlewareInChain = vi.fn()

    manageListenersMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
  })
})
