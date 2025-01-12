import {
  WebSocketDataSource,
  WebSocketManagerAPI,
  WebSocketManagerAction,
} from '../../types'
import appendToDebugField from '../appendToDebugField'

const LOGGING_KEY = 'manageConnections'

export default class ConnectionsMiddleware {
  private disconnectIntent = new Map<WebSocketDataSource, boolean>()

  constructor(private managerAPI: WebSocketManagerAPI) {
    this.managerAPI = managerAPI
    this.handle = this.handle.bind(this)
    this.createConnection = this.createConnection.bind(this)
  }

  createConnection<S extends WebSocketDataSource>(source: S) {
    console.log('in create connection')
    this.disconnectIntent.delete(source)

    const ws = new WebSocket(source)
    console.log('about to set')
    this.managerAPI.setConnection(source, ws)

    ws.onmessage = (event) => {
      const rawData = event.data
      this.managerAPI.onReceiveData(rawData, source)
    }

    ws.onclose = () => {
      const isIntentional = this.disconnectIntent.get(source)

      if (!isIntentional) {
        setTimeout(() => {
          console.log('reestablishing connection')
          const listeners = this.managerAPI.getListeners(source)
          console.log('listeners', { listeners })
          if (listeners.size > 0) {
            this.createConnection(source)
          }
        }, 1000)
      } else {
        this.disconnectIntent.delete(source)
      }
    }
  }

  handle<S extends WebSocketDataSource>(
    next: (action: WebSocketManagerAction<S>) => void,
  ) {
    return (action: WebSocketManagerAction<S>) => {
      if (action.type === 'DATA_RECEIVED') {
        next(action)
        return
      }

      let modifiedAction: WebSocketManagerAction<S> | undefined = undefined

      const connection = this.managerAPI.getConnection(action.payload.source)
      const listeners = this.managerAPI.getListeners(action.payload.source)
      const source = action.payload.source

      if (action.type === 'SUBSCRIBE') {
        if (connection === undefined) {
          this.createConnection(source)
          modifiedAction = appendToDebugField(
            action,
            LOGGING_KEY,
            `Established connection for source ${source}`,
          ) as WebSocketManagerAction<S>
        }
      }

      if (action.type === 'UNSUBSCRIBE') {
        if (listeners.size === 0) {
          this.disconnectIntent.set(source, true)

          const ws = this.managerAPI.getConnection(source)
          if (!ws) {
            this.disconnectIntent.delete(source)
            next(action)
            return
          }

          if (ws.readyState === WebSocket.CONNECTING) {
            ws.addEventListener('open', () => {
              ws.close()
            })
          } else if (ws.readyState === WebSocket.OPEN) {
            ws.close()
          }

          this.managerAPI.deleteConnection(source)
          this.managerAPI.purgeLatestData(source)
          modifiedAction = appendToDebugField(
            action,
            LOGGING_KEY,
            `Purged connection to source ${source}. Data purged.`,
          ) as WebSocketManagerAction<S>
        }
      }
      next(modifiedAction ?? action)
    }
  }
}
