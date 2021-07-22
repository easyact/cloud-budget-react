import {useState} from 'react'

function Switch({state: [hiding, setHiding]}) {
    return <button onClick={() => setHiding(!hiding)} className="button">{hiding ? '展开' : '收起'}</button>
}

export function TimelineViz() {
    const state = useState(true)
    if (state[0])
        return <Switch state={state}/>
    return <section>
        <Switch state={state}/>
        <svg width="100%" height={300}>
            <path d="M10 10"/>
            <circle cx="10" cy="10" r="20" fill="red"/>
        </svg>
    </section>
}
