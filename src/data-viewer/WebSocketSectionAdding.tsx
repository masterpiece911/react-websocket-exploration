import clsx from "clsx";
import { WebSocketDataMap } from "../ws/types";

const buttons = [
    {
        label: 'A',
        source: 'ws://localhost:8080/A'
    },
    {
        label: 'B',
        source: 'ws://localhost:8080/B'
    },
    {
        label: 'C',
        source: 'ws://localhost:8080/C'
    },
] as const

export default function WebSocketSectionAdding({addSection}: {addSection: (source: keyof WebSocketDataMap) => void}){
    return <div className='add-section-menubar'>
        <span>Select Source</span>
        {buttons.map(({label, source}) => (
            <button className={clsx('add-section-button', label)} key={label} type='button' onClick={() => addSection(source)}>
                {label}
            </button>
        ))}
    </div>
}