import { WebSocketManagerMiddleware } from '../../types'
import appendToDebugField from '../appendToDebugField'

const LOGGING_KEY = 'notifyListeners'

const notifyListenersMiddleware: WebSocketManagerMiddleware =
  (manageAPI) => (next) => (action) => {
    if (action.type !== 'DATA_RECEIVED') {
      next(action)
      return
    }

    const {
      payload: { source },
    } = action
    const listeners = manageAPI.getListeners(source)
    const latestData = manageAPI.getLatestData(source)

    if (latestData !== undefined)
      listeners.forEach((callback) => callback(latestData))

    next(
      appendToDebugField(
        action,
        LOGGING_KEY,
        `Notified ${listeners.size} listeners about data from source ${source}`,
      ),
    )
  }

export default notifyListenersMiddleware
