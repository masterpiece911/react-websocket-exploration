import { vi } from 'vitest'
import reduxDevtoolsMiddleware from '.'
import { createWebSocketManagerMock } from '../__mocks__/WebSocketManager.mock'
import { WebSocketDataSource, WebSocketManagerAction } from '../../types'

describe('redux devtools middleware', () => {
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

    reduxDevtoolsMiddleware(manager)(nextMiddlewareInChain)(originalAction)

    expect(nextMiddlewareInChain).toHaveBeenCalledWith(originalAction)
  })
})
