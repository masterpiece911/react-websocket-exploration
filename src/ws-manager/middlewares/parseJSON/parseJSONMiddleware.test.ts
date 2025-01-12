import { vi } from 'vitest'
import parseJSONMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
} from '../../types'

type ActionThatParseJSONAccepts = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'DATA_RECEIVED' }
>
type ActionThatParseJSONIgnores = Extract<
  WebSocketManagerAction<WebSocketDataSource>,
  { type: 'SUBSCRIBE' | 'UNSUBSCRIBE' }
>

describe('parseJSONMiddleware', () => {
  it('should add a json representation of the provided raw string in the data property', () => {
    const data: WebSocketDataMap['ws://localhost:8080/A'] = { value: 1 }
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'OK',
        raw: JSON.stringify(data),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalled()

    const call = nextMiddlewareInChain.mock.calls[0]

    expect(call[0].payload.data).toEqual(data)
  })

  it('should keep status OK when parsing is successful', () => {
    const data: WebSocketDataMap['ws://localhost:8080/A'] = { value: 1 }
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'OK',
        raw: JSON.stringify(data),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalled()

    const call = nextMiddlewareInChain.mock.calls[0]

    expect(call[0].payload.status).toEqual('OK')
  })

  it('should pass actions with payload status INVALID without any modification', () => {
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        status: 'INVALID',
        raw: 'foobar',
        source: 'ws://localhost:8080/A',
        reason: 'Some other middleware rejection',
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
  })

  it('should set the payload status to INVALID when parsing fails', () => {
    const nonJSONData = 'corrupt transmission'
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'OK',
        raw: nonJSONData,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalled()

    const call = nextMiddlewareInChain.mock.calls[0]

    expect(call[0].payload.status).toEqual('INVALID')
  })

  it('should append a failure reason to the reason property when parsing fails', () => {
    const nonJSONData = 'corrupt transmission'
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'OK',
        raw: nonJSONData,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalled()

    const call = nextMiddlewareInChain.mock.calls[0]

    expect(call[0].payload.reason).toEqual('Data unparseable.')
  })

  it('should not append the data property when parsing fails', () => {
    const nonJSONData = 'corrupt transmission'
    const manager = createWebSocketManagerMock()

    const originalAction: ActionThatParseJSONAccepts = {
      type: 'DATA_RECEIVED',
      payload: {
        source: 'ws://localhost:8080/A',
        status: 'OK',
        raw: nonJSONData,
      },
    }

    const nextMiddlewareInChain = vi.fn()

    parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalled()

    const call = nextMiddlewareInChain.mock.calls[0]

    expect(call[0].payload.data).not.toBeDefined()
  })

  it.each(['SUBSCRIBE' as const, 'UNSUBSCRIBE' as const])(
    'should pass action type %s without any modification',
    (actionType) => {
      const manager = createWebSocketManagerMock()

      const originalAction: ActionThatParseJSONIgnores = {
        type: actionType,
        payload: {
          source: 'ws://localhost:8080/A',
          callback: vi.fn(),
        },
      }

      const nextMiddlewareInChain = vi.fn()

      parseJSONMiddleware(manager)(nextMiddlewareInChain)(originalAction)

      expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
    },
  )
})
