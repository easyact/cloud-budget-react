import {Trans} from 'react-i18next'
import * as R from 'ramda'

export function History({dispatch, events}) {
    const setLast = id => dispatch({type: 'SET_LAST_EVENT_ID', payload: id})
    return <div className="dropdown-content history">
        {R.reverse(events).map((e, i) => <div className="dropdown-item" key={i}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => setLast(e.id)}><Trans>{e.type}</Trans> 版本: {e.to?.version}
                <div className="ea-content">{JSON.stringify(e.payload)}</div>
            </a>
        </div>)}
    </div>
}
