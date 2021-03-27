import {useRef, useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {FaEdit, FaSave, FaTrash} from 'react-icons/all'
import {initValue} from './List'
import log from '../log'
import {formatDuration} from 'date-fns/esm/fp'

export function Item({index, columns, value, update, rm}) {
    log('Item')(value)
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
    const durationControl = {
        duration: {
            false: formatDuration,
            true: flow(Object.entries,
                ([unit, value]) => <div className="field has-addons">
                    <div className="field has-addons">
                        <p className="control">
                            <input value={value} className="input is-small"/>
                        </p>
                        <p className="control">
                            <span className="select is-small is-narrow">
                              <select value={unit}>
                                <option value="years">年</option>
                                <option value="months">月</option>
                                <option value="weeks">周</option>
                                <option value="days">日</option>
                                <option value="hours">小时</option>
                                <option value="minutes">分</option>
                                <option value="seconds">秒</option>
                              </select>
                            </span>
                        </p>
                    </div>
                </div>)
        }
    }
    const td = (type, editing) => durationControl[type]?.[editing]
        ?? ((v, key) => editing
            ? <input type={type} className="input is-small" defaultValue={v} ref={adding[key]}/>
            : v)
    const tds = columns.map(c => <td key={c.key + index}>{td(c.type, editing)(value[c.key], c.key)}</td>)
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
