import {useRef, useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {FaEdit, FaSave, FaTrash} from 'react-icons/all'
import {initValue} from './List'
import {log} from '../log'

export function Item({index, columns, value, update, rm}) {
    log('Item')(value)
    delete value.duration //TODO
    const [editing, setEditing] = useState(false)
    const adding = {}
    for (const c of columns) {
        const initValueElement = initValue[c.type]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        adding[c.key] = useRef(initValueElement)
    }
    const save = flow(
        () => setEditing(false),
        () => update(index, R.mapObjIndexed(r => r.current.value)(adding)))
    const tds = columns.map(c => <td key={c.key + index}>{
        editing ?
            <input type={c.type} className="input is-small" defaultValue={value[c.key]} ref={adding[c.key]}/> :
            value[c.key]
    }</td>)
    return <tr key={index}>
        {tds}
        <td key={`td${index}`}>
            <div className="field has-addons">
                {editing ? <div className="control">
                        <button className="button is-small" onClick={save}>
                            <FaSave/>
                        </button>
                    </div>
                    : <div className="control">
                        <button className="button is-small" onClick={() => setEditing(true)}>
                            <FaEdit/>
                        </button>
                    </div>
                }
                <div className="control">
                    <button className="button is-small" onClick={() => rm(index)}><FaTrash/></button>
                </div>
            </div>
        </td>
    </tr>
}
