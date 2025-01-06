import clsx from 'clsx'
import { WebSocketDataSource } from '../ws-manager/types'
import { SECTION_BUTTONS } from '../common-client/sources'

export default function DataSectionHeader({
  addSection,
}: {
  addSection: (source: WebSocketDataSource) => void
}) {
  return (
    <div className="add-section-menubar">
      <span>Select Source</span>
      {SECTION_BUTTONS.map(({ label, source }) => (
        <button
          className={clsx('add-section-button', label)}
          key={label}
          type="button"
          onClick={() => addSection(source)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
