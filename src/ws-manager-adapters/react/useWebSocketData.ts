// useWebSocketData.ts
import { useSyncExternalStore, useCallback } from 'react'
import webSocketManager from '../../ws-manager'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketStatus,
} from '../../ws-manager/types'

const INITIAL_VALUE = { status: 'INITIAL' } as const

export function useWebSocketData<S extends WebSocketDataSource>(
  source: S,
): WebSocketStatus<WebSocketDataMap[S]> {
  const subscribe = useCallback(
    (callback: (status: WebSocketStatus<WebSocketDataMap[S]>) => void) => {
      return webSocketManager.subscribe(source, callback)
    },
    [source],
  )

  const getSnapshot = useCallback(() => {
    return webSocketManager.getLatestData(source) || INITIAL_VALUE
  }, [source])

  return useSyncExternalStore(subscribe, getSnapshot)
}
