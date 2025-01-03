// useWebSocketData.ts
import { useSyncExternalStore, useCallback } from 'react';
import webSocketManager from './WebSocketManager';
import { WebSocketDataMap, WebSocketStatus } from './types';

const INITIAL_VALUE = { status: "INITIAL"} as const

export function useWebSocketData<T extends keyof WebSocketDataMap>(
  source: T
): WebSocketStatus<WebSocketDataMap[T]> {
  const subscribe = useCallback(
    (callback: (status: WebSocketStatus<WebSocketDataMap[T]>) => void) => {
      return webSocketManager.subscribe(source, callback);
    },
    [source]
  );

  const getSnapshot = useCallback(() => {
    return webSocketManager.latestData[source] || INITIAL_VALUE;
  }, [source]);

  return useSyncExternalStore(subscribe, getSnapshot);
}