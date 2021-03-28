import {useRef, useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {FaEdit, FaSave, FaTrash} from 'react-icons/all'
import {initValue} from './List'
import log from '../log'
import {formatDurationWithOptions} from 'date-fns/esm/fp'
import locale from 'date-fns/locale/zh-CN/index'

export function Item({index, columns, value, update, rm}) {
    log('Item')(value)
    const [editing, setEditing] = useState(false)
    const adding = {}
    for (const c of columns) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        adding[c.key] = useRef(initValue[c.type])
        // console.log('Item.adding', c.key, adding[c.key])
    }
    const save = flow(
        () => setEditing(false),
        () => update(index, R.mapObjIndexed(r => r.current.value, adding))
    )
    const durationControl = {
        duration: {
            false: formatDurationWithOptions({locale}),
            true: function (duration, key) {
                return Object.entries(duration).map(([unit, value], index) =>
                    <div className="field has-addons" key={`duration-${index}`}>
                        <div className="field has-addons">
                            <p className="control">
                                <input defaultValue={value} className="input is-small"
                                       onChange={v => adding[key].current[unit] = v}/>
                            </p>
                            <p className="control">
                            <span className="select is-small is-narrow">
                              <select defaultValue={unit} onChange={event => {
                                  const u = event.target.value
                                  const current = adding[key].current || {value: {}}
                                  console.log('Selecting', unit, u, current, adding)
                                  current.value = {[u]: value}
                                  // delete current[unit]
                              }}>
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
                    </div>
                )
            }
        }
    }
    const td = (type, editing) => durationControl[type]?.[editing]
        ?? ((v, key) => editing
            ? <input type={type} className="input is-small" defaultValue={v} ref={adding[key]}/>
            : v)
    return <tr key={index}>
        {columns.map(c => {
            const tdF = td(c.type, editing)
            console.log('tdF', value[c.key], c.key)
            return <td key={c.key + index}>{tdF(value[c.key], c.key)}</td>
        })}
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
