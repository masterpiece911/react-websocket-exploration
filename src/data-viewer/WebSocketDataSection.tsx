import clsx from 'clsx'
import { WebSocketDataMap } from "../ws/types";
import { useWebSocketData } from "../ws/useWebSocketData";

function getTextAfterLastSlash(input: unknown) {
  if (typeof input !== 'string') {
    throw new TypeError("Input must be a string")
  }
  const lastSlashIndex = input.lastIndexOf("/")
  return lastSlashIndex !== -1 ? input.slice(lastSlashIndex + 1) : input
}

export default function WebSocketDataSection({sourceURL, onClose}: {sourceURL: keyof WebSocketDataMap, onClose: () => void}) {
  const data = useWebSocketData(sourceURL)
  const source = getTextAfterLastSlash(sourceURL)

  return <section className={ clsx("websocket-section", source) }>
    <button className="close-section-button" type="button" onClick={onClose}>X</button>
    <span className="source-indicator">{source}</span>
    <div className={clsx('data', data.status)}>
    {data.status === 'INITIAL' && <>
      <div key='progress-bar' style={{'--progress-width': '0%'} as any} />
      <span>No data received yet</span>
    </>}
    {data.status === 'OK' && <>
      <div key='progress-bar' style={{'--progress-width': `${data.data.value * 100}%`} as any} />
    </>}
    {data.status === "UNPARSEABLE" && <>
      <div key='progress-bar' style={{'--progress-width': '0%'} as any} />
      <span>Data unparseable</span>
    </>}
    {data.status === "CRC_FAILED" && <>
      <div key='progress-bar' style={{'--progress-width': '0%'} as any} />
      <span>Data failed CRC</span>
    </>}
    </div>
  </section>
}