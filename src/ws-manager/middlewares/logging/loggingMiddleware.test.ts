import { vi } from 'vitest'
import loggingMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import { WebSocketDataSource, WebSocketManagerAction } from '../../types'

describe('logging middleware', () => {
  it('should pass the provided action unchanged', () => {
    const manager = createWebSocketManagerMock()

    const originalAction: WebSocketManagerAction<WebSocketDataSource> = {
      type: 'SUBSCRIBE',
      payload: {
        source: 'ws://localhost:8080/A',
        callback: vi.fn(),
      },
    }

    const nextMiddlewareInChain = vi.fn()

    loggingMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
  })
})
