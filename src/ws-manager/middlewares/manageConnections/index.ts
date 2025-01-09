import { WebSocketManagerAPI } from '../../types'
import ConnectionsMiddleware from './ConnectionsMiddleware'

export default (managerAPI: WebSocketManagerAPI) => {
  return new ConnectionsMiddleware(managerAPI).handle
}
