import clsx from 'clsx'
import { useWebSocketData } from '../ws-manager-adapters/react/useWebSocketData'
import { WebSocketDataSource, WebSocketStatus } from '../ws-manager/types'
import { getTextAfterLastSlash } from '../common-client/sourceHelperFunctions'

const getStatusText = (data: WebSocketStatus<unknown>) => {
  if (data.status === 'INITIAL') return 'No data received yet.'
  if (data.status === 'INVALID') return data.reason
  return ''
}

export default function WebSocketDataSection({
  sourceURL,
  onClose,
}: {
  sourceURL: WebSocketDataSource
  onClose: () => void
}) {
  const data = useWebSocketData(sourceURL)
  const source = getTextAfterLastSlash(sourceURL)

  return (
    <section className={clsx('websocket-section', source)}>
      <button className="close-section-button" type="button" onClick={onClose}>
        X
      </button>
      <span className="source-indicator">{source}</span>
      <div className={clsx('data', data.status)}>
        <div
          style={
            {
              '--progress-width': `${data.status === 'OK' ? data.data.value * 100 : 0}%`,
            } as React.CSSProperties
          }
        />
        <span>{getStatusText(data)}</span>
        {/* {data.status === "INITIAL" && (
          <>
            <div
              key="progress-bar"
              style={{ "--progress-width": "0%" } as React.CSSProperties}
            />
            <span>No data received yet</span>
          </>
        )}
        {data.status === "OK" && (
          <>
            <div
              key="progress-bar"
              style={{ "--progress-width": `${data.data.value * 100}%` } as any}
            />
          </>
        )}
        {data.status === "UNPARSEABLE" && (
          <>
            <div
              key="progress-bar"
              style={{ "--progress-width": "0%" } as any}
            />
            <span>Data unparseable</span>
          </>
        )}
        {data.status === "CRC_FAILED" && (
          <>
            <div
              key="progress-bar"
              style={{ "--progress-width": "0%" } as any}
            />
            <span>Data failed CRC</span>
          </>
        )} */}
      </div>
    </section>
  )
}
