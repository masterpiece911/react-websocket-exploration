export interface WebSocketDataMap {
  'ws://localhost:8080/A': { value: number }
  'ws://localhost:8080/B': { value: number }
  'ws://localhost:8080/C': { value: number }
  // Add more sources and types as needed
}

export type WebSocketDataSource = {
  [K in keyof WebSocketDataMap]: K
}[keyof WebSocketDataMap]

export type WebSocketStatus<T> =
  | { status: 'INITIAL' }
  | { status: 'OK'; data: T }
  | { status: 'INVALID'; raw: string; reason: string }

export type WebSocketManagerConnections = Map<WebSocketDataSource, WebSocket>

export type WebSocketManagerListeners = Map<
  WebSocketDataSource,
  Set<(status: WebSocketStatus<any>) => void>
>

export type WebSocketManagerData = Partial<
  Record<WebSocketDataSource, WebSocketStatus<any>>
>

export type WebSocketManagerAPI = {
  onReceiveData: (data: unknown, source: WebSocketDataSource) => void
  subscribe: <S extends WebSocketDataSource>(
    source: S,
    callback: (status: WebSocketStatus<WebSocketDataMap[S]>) => void,
  ) => () => void
  unsubscribe: <S extends WebSocketDataSource>(
    source: S,
    callback: (status: WebSocketStatus<WebSocketDataMap[S]>) => void,
  ) => void
  getListeners: (
    source: WebSocketDataSource,
  ) => Set<(status: WebSocketStatus<any>) => void>
  getConnection: (source: WebSocketDataSource) => WebSocket | undefined
  setConnection: (source: WebSocketDataSource, connection: WebSocket) => void
  deleteConnection: (source: WebSocketDataSource) => void
  getLatestData: <S extends WebSocketDataSource>(
    source: WebSocketDataSource,
  ) => WebSocketStatus<WebSocketDataMap[S]> | undefined
  __getAllLatestData: () => WebSocketManagerData
  setLatestData: <S extends WebSocketDataSource>(
    source: S,
    data: WebSocketStatus<WebSocketDataMap[S]>,
  ) => void
  purgeLatestData: (source: WebSocketDataSource) => void
}

export type WebSocketManagerAction<S extends WebSocketDataSource> =
  | {
      type: 'DATA_RECEIVED'
      payload: {
        status: Extract<
          WebSocketStatus<WebSocketDataMap[S]>['status'],
          'OK' | 'INVALID'
        >
        source: S
        raw: string
        reason?: string
        crc?: string
        data?: WebSocketDataMap[S]
        debug?: { [x in string]: string }
      }
    }
  | {
      type: 'SUBSCRIBE'
      payload: {
        source: S
        callback: (status: WebSocketStatus<WebSocketDataMap[S]>) => void
        debug?: { [x in string]: string }
      }
    }
  | {
      type: 'UNSUBSCRIBE'
      payload: {
        source: S
        callback: (status: WebSocketStatus<WebSocketDataMap[S]>) => void
        debug?: { [x in string]: string }
      }
    }

export type WebSocketManagerMiddleware = <S extends WebSocketDataSource>(
  managerAPI: WebSocketManagerAPI,
) => (
  next: (action: WebSocketManagerAction<S>) => void,
) => (action: WebSocketManagerAction<S>) => void
