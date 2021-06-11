import {useRef, useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {FaEdit, FaPlus, FaSave, FaTrash} from 'react-icons/all'
import {formatDurationWithOptions} from 'date-fns/esm/fp'
import locale from 'date-fns/locale/zh-CN/index'
import log from '../log'

function DurationControl(fields) {
    return {
        duration: {
            false: formatDurationWithOptions({locale}),
            true: DurationEditor
        }
    }

    function DurationEditor(duration = {months: 1}, key) {
        const current = fields[key].current = {value: duration}
        return Object.entries(duration).map(([unit, value], index) =>
            <div className="field has-addons" key={`duration-${index}`}>
                <div className="field has-addons">
                    <p className="control">
                        <input defaultValue={value} className="input is-small"
                               onChange={v => current.value[unit] = v}/>
                    </p>
                    <p className="control">
                    <span className="select is-small is-narrow">
                      <select defaultValue={unit} onChange={event => {
                          const u = event.target.value
                          console.log('Selecting', unit, u, current, fields)
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

export function Item({index, columns, value, update, rm}) {
    // log('Item')(value)
    const [editing, setEditing] = useState(!value)
    const fields = {}
    for (const column of columns) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        fields[column.key] = useRef(value?.[column.key])
        // console.log('Item.fields', column.key, fields[column.key])
    }

    function add() {
        console.log('List add', fields)
        update(R.mapObjIndexed(r => r.current.value)(fields))
        columns.map(c => c.key).forEach(t => fields[t].current.value = null)
    }

    const save = flow(
        () => log('Item.saving fields')(R.mapObjIndexed(r => r.current, fields)),
        () => setEditing(false),
        () => update(log('Item.saving')({...R.mapObjIndexed(r => r.current.value, fields), id: value.id}), index)
    )
    const durationControl = DurationControl(fields)
    const td = (type, editing) => durationControl[type]?.[editing] ?? ((v, key) => editing
        ? <input type={type} className="input is-small" defaultValue={v} ref={fields[key]}/>
        : v)
    return <tr key={index}>
        {columns.map(c => <td key={c.key + index}>{td(c.type, editing)(value?.[c.key], c.key)}</td>)}
        <td key={`td${index}`}>
            {value ?
                <div className="field has-addons">
                    {editing ?
                        <div className="control">
                            <button className="button is-small" onClick={save}>
                                <FaSave/>
                            </button>
                        </div> :
                        <div className="control">
                            <button className="button is-small" onClick={() => setEditing(true)}>
                                <FaEdit/>
                            </button>
                        </div>
                    }
                    <div className="control">
                        <button className="button is-small" onClick={() => rm(value.id)}><FaTrash/></button>
                    </div>
                </div> :
                <div className="field has-addons">
                    <div className="control">
                        <button className="button is-small is-success" onClick={add}>
                            <FaPlus/>
                        </button>
                    </div>
                </div>}
        </td>
    </tr>
}
