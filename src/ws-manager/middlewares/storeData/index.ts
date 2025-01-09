import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketManagerAction,
  WebSocketManagerMiddleware,
  WebSocketStatus,
} from '../../types'
import appendToDebugField from '../appendToDebugField'

const LOGGING_KEY = 'storeData'

const storedDataFromAction = <S extends WebSocketDataSource>(
  action: Extract<WebSocketManagerAction<S>, { type: 'DATA_RECEIVED' }>,
): WebSocketStatus<WebSocketDataMap[S]> => {
  // we assume that all data parsing has occured before this middleware and thus we can assume data or reason exists.
  switch (action.payload.status) {
    case 'OK':
      return { status: 'OK', data: action.payload.data! }
    case 'INVALID':
      return {
        status: 'INVALID',
        reason: action.payload.reason!,
        raw: action.payload.raw,
      }
  }
}

const storeDataMiddleware: WebSocketManagerMiddleware =
  (managerAPI) => (next) => (action) => {
    if (action.type !== 'DATA_RECEIVED') {
      next(action)
      return
    }

    const storedData = storedDataFromAction(action)
    managerAPI.setLatestData(action.payload.source, storedData)

    next(
      appendToDebugField(
        action,
        LOGGING_KEY,
        `Set latest data of source ${action.payload.source} to value of action.payload.data`,
      ),
    )
  }

export default storeDataMiddleware
