export function History({dispatch, events}) {
    const setLast = id => dispatch({type: 'SET_LAST_EVENT_ID', payload: id})
    return <div className="dropdown-content history">
        {events.map((e, i) => <div className="dropdown-item" key={i}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => setLast(e.id)}>{e.type} 分支: {e.to?.version}
                <div className="ea-content">{JSON.stringify(e.payload)}</div>
            </a>
        </div>)}
    </div>
}
