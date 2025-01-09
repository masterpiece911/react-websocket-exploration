import { WebSocketManagerMiddleware } from '../../types'

export const reduxDevtoolsPublisher: WebSocketManagerMiddleware = (api) => {
  let devTools: any

  // Check if the Redux DevTools extension is available
  if (
    typeof window !== 'undefined' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__
  ) {
    // Connect to the Redux DevTools extension
    devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
      name: 'WebSocketManager',
    })

    // Initialize the DevTools with the current state
    devTools.init(api.__getAllLatestData(), { name: '' })
  }

  return (next) => (action) => {
    // Forward the action to the next middleware
    next(action)

    // After the action has been processed, send it to the DevTools
    if (devTools) {
      devTools.send(
        action,
        api.__getAllLatestData(), // Send the latest state after the action has been applied
      )
    }
  }
}

export default reduxDevtoolsPublisher
