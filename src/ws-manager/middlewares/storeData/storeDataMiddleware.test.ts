import { vi } from 'vitest'
import storeDataMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
} from '../../types'

type ActionThatStoreDataAccepts = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'DATA_RECEIVED' }
>
type ActionThatStoreDataIgnores = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'SUBSCRIBE' | 'UNSUBSCRIBE' }
>

describe('store data middleware', () => {
  it('should store data when its status is OK', () => {
    const manager = createWebSocketManagerMock()

    const dataSource: WebSocketDataSource = 'ws://localhost:8080/A' as const
    const newData: WebSocketDataMap[typeof dataSource] = { value: 1 }

    const action: ActionThatStoreDataAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: dataSource,
        raw: JSON.stringify(newData),
        data: newData,
        status: 'OK',
      },
    }

    const nextMiddlewareInChain = vi.fn()

    storeDataMiddleware(manager)(nextMiddlewareInChain)(action)

    expect(nextMiddlewareInChain).toHaveBeenCalled()
    expect(manager.setLatestData).toHaveBeenCalled()

    const [sourceParameter, dataParameter] = manager.setLatestData.mock.calls[0]

    expect(sourceParameter).toEqual(dataSource)
    expect(dataParameter).toEqual({ data: newData, status: 'OK' })
  })

  it('should store raw data and failure reason when its status is INVALID', () => {
    const manager = createWebSocketManagerMock()

    const dataSource: WebSocketDataSource = 'ws://localhost:8080/A' as const
    const raw = 'CORRUPT DATA'
    const reason = 'Some middleware rejection'
    const status = 'INVALID'

    const action: ActionThatStoreDataAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: dataSource,
        raw,
        reason,
        status,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    storeDataMiddleware(manager)(nextMiddlewareInChain)(action)

    expect(nextMiddlewareInChain).toHaveBeenCalled()
    expect(manager.setLatestData).toHaveBeenCalled()

    const [sourceParameter, dataParameter] = manager.setLatestData.mock.calls[0]

    expect(sourceParameter).toEqual(dataSource)
    expect(dataParameter).toEqual({ raw, reason, status })
  })
  it.each(['SUBSCRIBE' as const, 'UNSUBSCRIBE' as const])(
    'should pass action type %s without any modification',
    (actionType) => {
      const manager = createWebSocketManagerMock()

      const originalAction: ActionThatStoreDataIgnores = {
        type: actionType,
        payload: {
          source: 'ws://localhost:8080/A',
          callback: vi.fn(),
        },
      }

      const nextMiddlewareInChain = vi.fn()

      storeDataMiddleware(manager)(nextMiddlewareInChain)(originalAction)

      expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
    },
  )
})
