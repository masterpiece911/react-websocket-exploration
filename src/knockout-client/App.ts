import ko from 'knockout'
import { WebSocketDataSource } from '../ws-manager/types'

const INITIAL_VALUE: WebSocketDataSource[] = ['ws://localhost:8080/A']
const VALID_SOURCES: WebSocketDataSource[] = [
  'ws://localhost:8080/A',
  'ws://localhost:8080/B',
  'ws://localhost:8080/C',
]

function stringIsSource(
  possibleSource: string,
): possibleSource is WebSocketDataSource {
  return VALID_SOURCES.includes(possibleSource as WebSocketDataSource)
}

export default class App {
  sources: KnockoutObservableArray<WebSocketDataSource> =
    ko.observableArray(INITIAL_VALUE)

  constructor() {
    this.addSource = this.addSource.bind(this)
    this.removeSource = this.removeSource.bind(this)
  }

  addSource(source: unknown) {
    if (typeof source !== 'string') {
      return
    }
    if (!stringIsSource(source)) {
      return
    }

    this.sources.push(source)
  }

  removeSource(index: unknown) {
    console.log('in remove source', { index })
    if (typeof index !== 'number') {
      return
    }

    this.sources(
      this.sources.peek().filter((_, sourcesIndex) => sourcesIndex !== index),
    )
  }
}
