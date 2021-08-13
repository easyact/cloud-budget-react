import {useState} from 'react'
import {flow} from 'fp-ts/es6/function'
import * as R from 'ramda'
import {
    FaChevronDown,
    FaChevronUp,
    FaEdit,
    FaPlus,
    FaSave,
    FaStepBackward,
    FaStepForward,
    FaTrash
} from 'react-icons/all'
import {formatDurationWithOptions} from 'date-fns/esm/fp'
import locale from 'date-fns/locale/zh-CN/index'
import log from '../log'
import {formatDate} from './util'
import {parseISO} from 'date-fns'

const setItemByEvent = (key, item, setItem, change = R.identity) => flow(
    R.path(['target', 'value']),
    log(`Before Setting ${key}, item is ${JSON.stringify(item)}, value is`),
    change,
    log(`changed is`),
    R.set(R.lensProp(key), R.__, item),
    log('Setting item'),
    setItem)

const DEFAULT_DURATION = {months: 1}

function DurationControl(item, setItem) {
    return {
        duration: {
            false: flow(R.defaultTo(DEFAULT_DURATION), formatDurationWithOptions({locale})),
            true: DurationEditor
        }
    }

    function DurationEditor(duration = DEFAULT_DURATION, key) {
        // const current = item[key] = {value: duration}
        return Object.entries(duration).map(([unit, value], index) =>
            <div className="field has-addons" key={`duration-${index}`}>
                <div className="field has-addons">
                    <p className="control">
                        <input defaultValue={value} className="input is-small" type="number"
                               onChange={setItemByEvent(key, item, setItem, parseInt)}/>
                    </p>
                    <p className="control">
                    <span className="select is-small is-narrow">
                      <select defaultValue={unit} onChange={
                          // event => {
                          //     const u = event.target.value
                          //     console.log('Selecting', unit, u, current, fields)
                          //     current.value = {[u]: value}
                          //     // delete current[unit]
                          // }
                          setItemByEvent(key, item, setItem, u => ({[u]: value}))
                      }>
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

// function Date({editing, ref, key}) {
//     return <div>
//         <div className="field-label is-normal">
//             <label className="label">开始</label>
//         </div>
//         <div className="field-body">
//             <div className="field">
//                 {editing ? <p className="control is-expanded has-icons-left">
//                     <input className="input" type="date" placeholder="开始"
//                            defaultValue={ref.current[key]}/>
//                     <span className="icon is-small is-left">
//                         <FaStepBackward/>
//                     </span>
//                 </p> : <p className="control">{ref.current[key]}</p>}
//             </div>
//         </div>
//     </div>
// }

export function Item({index, columns, value, update, rm}) {
    const [editing, setEditing] = useState(!value)
    const [folded, setFolded] = useState(true)
    const [item, setItem] = useState(value)

    // log('Item')(item)

    function add() {
        console.log('List add', item)
        update(item)
    }

    function save() {
        console.log('List set', item)
        setEditing(false)
        update(item)
    }

    const durationControl = DurationControl(item, setItem)
    const td = (type, editing) => durationControl[type]?.[editing] ?? ((defaultValue, key) => editing
        ? <input type={type} className="input is-small" defaultValue={defaultValue}
                 onChange={setItemByEvent(key, item, setItem)}/>
        : defaultValue)
    // console.log('div', value, columns)
    // if (!folded)
    //     return <div>
    const opTd = <div key={`td${index}`} className="column">
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
                <div className="control">
                    <button className="button is-small" onClick={() => setFolded(!folded)}>
                        {folded ? <FaChevronDown/> : <FaChevronUp/>}
                    </button>
                </div>
            </div> :
            <div className="field has-addons">
                <div className="control">
                    <button className="button is-small is-success" onClick={add}>
                        <FaPlus/>
                    </button>
                </div>
            </div>}
    </div>
    const mainCells = columns.map(c => <div className="column" key={c.key + index}>
        {td(c.type, editing)(value?.[c.key], c.key)}</div>)
    const tr = <section className="panel-block columns">
        {mainCells}
        {opTd}
    </section>
    if (folded) {
        return tr
    }
    const start = formatDate(value.start)
    const end = formatDate(value.end)
    return <section>
        {tr}
        <div className="panel-block">
            <div className="field is-horizontal">
                {/*<Date editing={editing}/>*/}
                <div className="field-label is-normal">
                    <label className="label">开始</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        {editing ? <p className="control is-expanded has-icons-left">
                            <input className="input" type="date" placeholder="开始"
                                   defaultValue={start} onChange={setItemByEvent('start', item, setItem, parseISO)}/>
                            <span className="icon is-small is-left">
                                        <FaStepBackward/>
                                    </span>
                        </p> : <p className="control">{start}</p>}
                    </div>
                </div>
                <div className="field-label is-normal">
                    <label className="label">结束</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded has-icons-left">
                            <input className="input" type="text" placeholder="结束时间"/>
                            <span className="icon is-small is-left">
                                        <FaStepForward/>
                                    </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
}
