import { produce } from 'immer'
import { WebSocketManagerMiddleware } from '../../types'
import appendToDebugField from '../appendToDebugField'

const LOGGING_KEY = 'parseJSON'

const jsonParsingMiddleware: WebSocketManagerMiddleware =
  (_) => (next) => (action) => {
    if (action.type !== 'DATA_RECEIVED') {
      next(action)
      return
    }

    if (action.payload.status !== 'OK') {
      // early return if prior parsing failed
      next(action)
      return
    }

    const {
      payload: { raw: rawData },
    } = action

    try {
      const data = JSON.parse(rawData)
      next(
        appendToDebugField(
          produce(action, (draft) => {
            draft.payload.data = data
          }),
          LOGGING_KEY,
          'JSON parse successful',
        ),
      )
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : undefined

      next(
        appendToDebugField(
          produce(action, (draft) => {
            draft.payload.status = 'INVALID'
            delete draft.payload.data
            draft.payload.reason = `Data unparseable.`
          }),
          LOGGING_KEY,
          `JSON parse failed: ${error}`,
        ),
      )
    }
  }

export default jsonParsingMiddleware
