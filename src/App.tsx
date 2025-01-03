import { useState } from "react";
import { WebSocketDataMap } from "./ws/types";
import WebSocketSectionAdding from "./data-viewer/WebSocketSectionAdding";
import WebSocketDataSection from "./data-viewer/WebSocketDataSection";
import './App.css'

const App = () => {
  const [sections, setSections] = useState<(keyof WebSocketDataMap)[]>(['ws://localhost:8080/A'])

  return (
    <>
      <h1>WebSocket Data Viewer</h1>

      <WebSocketSectionAdding addSection={(source) => setSections(previous => [ ...previous, source ])} />

      <div className='section-container'>
        {sections.map((source, index) => (
          <WebSocketDataSection
            key={index}
            sourceURL={source}
            onClose={() => setSections(sections => sections.filter((_, sourceIndex) => sourceIndex !== index))}
          />
        ))}
      </div>

    </>
  );
};

export default App;