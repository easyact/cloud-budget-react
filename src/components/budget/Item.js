import {useRef, useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {FaEdit, FaSave, FaTrash} from 'react-icons/all'
import {initValue} from './List'

export function Item({index, columns, value, update, rm}) {
    const [editing, setEditing] = useState(false)
    const adding = {}
    for (const c of columns) {
        const initValueElement = initValue[c.type]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        adding[c.title] = useRef(initValueElement)
    }
    return <tr key={index}>
        {columns.map(c => (
            <td key={c.title + index}>{editing ?
                <input type={c.type} className="input is-small" defaultValue={value[c.title]} ref={adding[c.title]}/> :
                value[c.title]}
            </td>
        ))}

        <td key={`td${index}`}>
            <div className="field has-addons">
                {editing ? (
                    <div className="control">
                        <button className="button is-small" onClick={flow(
                            () => setEditing(false),
                            () => update(index, R.mapObjIndexed(r => r.current.value)(adding)))}><FaSave/>
                        </button>
                    </div>) : (
                    <div className="control">
                        <button className="button is-small" onClick={() => setEditing(true)}>
                            <FaEdit/>
                        </button>
                    </div>
                )}
                <div className="control">
                    <button className="button is-small" onClick={() => rm(index)}><FaTrash/></button>
                </div>
            </div>
        </td>
    </tr>
}
