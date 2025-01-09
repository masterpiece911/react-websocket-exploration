import { WebSocketManagerMiddleware } from '../../types'
import appendToDebugField from '../appendToDebugField'

const LOGGING_KEY = 'manageListeners'

const manageListenersMiddleware: WebSocketManagerMiddleware =
  (manager) => (next) => (action) => {
    if (action.type === 'DATA_RECEIVED') {
      next(action)
      return
    }

    if (action.type === 'SUBSCRIBE') {
      const sourceListeners = manager.getListeners(action.payload.source)

      sourceListeners.add(action.payload.callback)

      const {
        payload: { source },
      } = action

      next(
        appendToDebugField(
          action,
          LOGGING_KEY,
          `Added listener for source ${source}`,
        ),
      )
    }

    if (action.type === 'UNSUBSCRIBE') {
      const sourceListeners = manager.getListeners(action.payload.source)
      sourceListeners.delete(action.payload.callback)

      const {
        payload: { source },
      } = action

      next(
        appendToDebugField(
          action,
          LOGGING_KEY,
          `Removed listener for source ${source}`,
        ),
      )
    }
  }

export default manageListenersMiddleware
