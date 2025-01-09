import { WebSocketManagerMiddleware } from '../../types'

const loggingMiddleware: WebSocketManagerMiddleware =
  (_) => (next) => (action) => {
    const {
      type,
      payload: { debug, ...payloadContents },
    } = action

    console.groupCollapsed('Websocket Action', type)
    console.log('Action payload', { ...payloadContents })

    console.log('Middleware debug logs:')
    if (debug !== undefined) {
      Object.keys(debug).forEach((debugKey) => {
        console.log(debugKey, debug[debugKey])
      })
    }

    console.groupEnd()

    next(action)
  }

export default loggingMiddleware
