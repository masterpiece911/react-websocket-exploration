import ko from 'knockout'
import webSocketManager from '../../ws-manager'
import {
  WebSocketDataMap,
  WebSocketDataSource,
  WebSocketStatus,
} from '../../ws-manager/types'

export type WebSocketObservable<T extends WebSocketDataSource> =
  KnockoutObservable<WebSocketStatus<WebSocketDataMap[T]>> & {
    dispose: () => void
  }

export function createWebSocketObservable<T extends WebSocketDataSource>(
  source: T,
): WebSocketObservable<T> {
  // Create a Knockout observable for WebSocket status1
  const statusObservable = ko.observable<WebSocketStatus<WebSocketDataMap[T]>>(
    webSocketManager.getLatestData(source) || { status: 'INITIAL' },
  )

  // Subscribe to the WebSocketManager
  const unsubscribe = webSocketManager.subscribe(source, (newStatus) => {
    statusObservable(newStatus) // Update Knockout observable
  })

  // Extend the observable with a proper `dispose` method
  const extendedObservable = Object.assign(statusObservable, {
    dispose: () => {
      unsubscribe() // Unsubscribe from WebSocketManager
    },
  })

  return extendedObservable
}
