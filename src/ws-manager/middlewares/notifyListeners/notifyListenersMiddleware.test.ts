import { vi } from 'vitest'
import notifyListenersMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
  WebSocketStatus,
} from '../../types'

type ActionThatNotifyListenersAccepts = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'DATA_RECEIVED' }
>
type ActionThatNotifyListenersIgnores = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'SUBSCRIBE' | 'UNSUBSCRIBE' }
>

describe('notify listeners middleware', () => {
  it('should notify all listeners of a data source with manager latestData when receiving DATA_RECEIVED actions', () => {
    const dataSource: WebSocketDataSource = 'ws://localhost:8080/A'
    const listenersForSourceA: Set<{
      (status: WebSocketStatus<WebSocketDataMap[typeof dataSource]>): void
    }> = new Set()
    listenersForSourceA.add(vi.fn())
    listenersForSourceA.add(vi.fn())
    listenersForSourceA.add(vi.fn())

    const newData: WebSocketStatus<WebSocketDataMap[typeof dataSource]> = {
      status: 'OK',
      data: { value: 1 },
    }

    const manager = createWebSocketManagerMock({
      initialListeners: new Map<
        WebSocketDataSource,
        Set<{
          (status: WebSocketStatus<WebSocketDataMap[WebSocketDataSource]>): void
        }>
      >().set('ws://localhost:8080/A', listenersForSourceA),
      initialLatestData: {
        [dataSource]: newData,
      },
    })

    const action: ActionThatNotifyListenersAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        data: newData.data,
        raw: JSON.stringify(newData),
        status: newData.status,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    notifyListenersMiddleware(manager)(nextMiddlewareInChain)(action)

    listenersForSourceA.forEach((listener) => {
      expect(listener).toHaveBeenCalledWith(newData)
    })
  })

  it.each(['SUBSCRIBE' as const, 'UNSUBSCRIBE' as const])(
    'should pass all action type %s without any modification',
    (actionType) => {
      const manager = createWebSocketManagerMock()

      const originalAction: ActionThatNotifyListenersIgnores = {
        type: actionType,
        payload: {
          source: 'ws://localhost:8080/A',
          callback: vi.fn(),
        },
      }

      const nextMiddlewareInChain = vi.fn()

      notifyListenersMiddleware(manager)(nextMiddlewareInChain)(originalAction)

      expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
    },
  )
})
