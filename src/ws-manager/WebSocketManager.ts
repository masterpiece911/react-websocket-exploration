import {
  WebSocketDataSource,
  WebSocketManagerAction,
  WebSocketManagerAPI,
  WebSocketManagerConnections,
  WebSocketManagerData,
  WebSocketManagerListeners,
  WebSocketManagerMiddleware,
  WebSocketStatus,
} from './types'

class WebSocketManager implements WebSocketManagerAPI {
  private connections: WebSocketManagerConnections = new Map<
    WebSocketDataSource,
    WebSocket
  >()
  private listeners: WebSocketManagerListeners = new Map<
    WebSocketDataSource,
    Set<(status: WebSocketStatus<any>) => void>
  >()
  private latestData: WebSocketManagerData = {}
  private middlewareChain:
    | ((action: WebSocketManagerAction<WebSocketDataSource>) => void)
    | null = null

  private dispatch(action: WebSocketManagerAction<WebSocketDataSource>) {
    if (!this.middlewareChain) {
      throw new Error(
        'Middleware chain not initialized. Call applyMiddleware before dispatching actions.',
      )
    }
    this.middlewareChain(action)
  }

  public applyMiddlewares = (...middlewares: WebSocketManagerMiddleware[]) => {
    this.middlewareChain = middlewares.reduceRight(
      (next, middleware) => middleware(this)(next),
      (_: WebSocketManagerAction<WebSocketDataSource>) => {},
    )
  }

  public subscribe: WebSocketManagerAPI['subscribe'] = (source, callback) => {
    this.dispatch({
      type: 'SUBSCRIBE',
      payload: { source, callback },
    })
    return () => this.unsubscribe(source, callback)
  }

  public unsubscribe: WebSocketManagerAPI['unsubscribe'] = (
    source,
    callback,
  ) => {
    this.dispatch({
      type: 'UNSUBSCRIBE',
      payload: { source, callback },
    })
  }

  public onReceiveData: WebSocketManagerAPI['onReceiveData'] = (
    rawData,
    source,
  ) => {
    if (typeof rawData !== 'string')
      throw new Error(
        `Expected raw string data, but received ${typeof rawData}`,
      )
    this.dispatch({
      type: 'DATA_RECEIVED',
      payload: { status: 'OK', source, raw: rawData },
    })
  }

  public getConnection: WebSocketManagerAPI['getConnection'] = (source) => {
    return this.connections.get(source)
  }

  public setConnection: WebSocketManagerAPI['setConnection'] = (
    source,
    connection,
  ) => {
    this.connections.set(source, connection)
  }

  public deleteConnection: WebSocketManagerAPI['deleteConnection'] = (
    source,
  ) => {
    this.connections.delete(source)
  }

  public getLatestData: WebSocketManagerAPI['getLatestData'] = (source) => {
    return this.latestData[source]
  }

  public __getAllLatestData: WebSocketManagerAPI['__getAllLatestData'] = () =>
    this.latestData

  public setLatestData: WebSocketManagerAPI['setLatestData'] = (
    source,
    data,
  ) => {
    this.latestData[source] = data
  }

  public purgeLatestData: WebSocketManagerAPI['purgeLatestData'] = (source) => {
    this.latestData[source] = undefined
  }

  public getListeners: WebSocketManagerAPI['getListeners'] = (source) => {
    if (this.listeners.get(source) === undefined) {
      this.listeners.set(
        source,
        new Set<(status: WebSocketStatus<any>) => void>(),
      )
    }

    return this.listeners.get(source) as Set<
      (status: WebSocketStatus<any>) => void
    >
  }
}

export default WebSocketManager
