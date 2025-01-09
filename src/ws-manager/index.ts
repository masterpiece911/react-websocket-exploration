import JsonParsingMiddleware from './middlewares/parseJSON'
import ManageListenersMiddleware from './middlewares/manageListeners'
import ManageConnectionsMiddleware from './middlewares/manageConnections'
import StoreDataMiddleware from './middlewares/storeData'
import NotifyListenersMiddleware from './middlewares/notifyListeners'
import LoggingMiddleware from './middlewares/logging'
import ReduxDevtoolsPublisherMiddleware from './middlewares/reduxDevtoolsAdapter'

import WebSocketManager from './WebSocketManager'

/* order of middlewares:
  - parseJSON
  - manageListeners
  - manageConnections
  - storeData
  - notifyListeners
  - logging
  - reduxDevtoolsAdapter
*/

const webSocketManager = new WebSocketManager()
const middlewares = [
  JsonParsingMiddleware,
  ManageListenersMiddleware,
  ManageConnectionsMiddleware,
  StoreDataMiddleware,
  NotifyListenersMiddleware,
]

const enableLoggerMiddleware = import.meta.env
  .VITE_ENABLE_WEBSOCKET_MANAGER_LOGGING
const enableReduxDevtoolsMiddleware = import.meta.env
  .VITE_ENABLE_WEBSOCKET_MANAGER_DEVTOOLS_ADAPTER

if (enableLoggerMiddleware) middlewares.push(LoggingMiddleware)
if (enableReduxDevtoolsMiddleware)
  middlewares.push(ReduxDevtoolsPublisherMiddleware)

webSocketManager.applyMiddlewares(...middlewares)

export default webSocketManager
