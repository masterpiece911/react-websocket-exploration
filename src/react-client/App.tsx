import { useState } from 'react'
import { WebSocketDataSource } from '../ws-manager/types'
import { INITIAL_VALUE } from '../common-client/sources'
import DataSectionHeader from './DataSectionHeader'
import WebSocketDataSection from './WebSocketDataSection'

const App = () => {
  const [sections, setSections] = useState<WebSocketDataSource[]>(INITIAL_VALUE)

  return (
    <>
      <DataSectionHeader
        addSection={(source) =>
          setSections((previous) => [...previous, source])
        }
      />

      <div className="section-container">
        {sections.map((source, index) => (
          <WebSocketDataSection
            key={index}
            sourceURL={source}
            onClose={() =>
              setSections((sections) =>
                sections.filter((_, sourceIndex) => sourceIndex !== index),
              )
            }
          />
        ))}
      </div>
    </>
  )
}

export default App
