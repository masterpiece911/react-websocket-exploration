import { produce } from 'immer'
import type { WebSocketDataSource, WebSocketManagerAction } from '../types'
export default function appendToDebugField<S extends WebSocketDataSource>(
  action: WebSocketManagerAction<S>,
  debugKey: string,
  value: string,
): WebSocketManagerAction<S> {
  return produce(action, (draft) => {
    if (draft.payload.debug === undefined) {
      draft.payload.debug = { [debugKey]: value }
    } else {
      draft.payload.debug[debugKey] = value
    }
  })
}
