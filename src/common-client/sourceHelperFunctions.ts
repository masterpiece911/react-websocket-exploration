import { WebSocketDataSource } from '../ws-manager/types'
import { VALID_SOURCES } from './sources'

export function isStringSource(
  possibleSource: unknown,
): possibleSource is WebSocketDataSource {
  return (
    typeof possibleSource === 'string' &&
    VALID_SOURCES.includes(possibleSource as any)
  )
}

export function getTextAfterLastSlash(input: unknown) {
  if (typeof input !== 'string') {
    throw new TypeError('Input must be a string')
  }
  const lastSlashIndex = input.lastIndexOf('/')
  return lastSlashIndex !== -1 ? input.slice(lastSlashIndex + 1) : input
}
