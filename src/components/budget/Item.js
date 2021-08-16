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
    FaStrikethrough,
    FaTrash
} from 'react-icons/all'
import {formatDurationWithOptions} from 'date-fns/esm/fp'
import locale from 'date-fns/locale/zh-CN/index'
import log from '../log'

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
            false: formatDurationWithOptions({locale}),
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
                               onChange={setItemByEvent(key, item, setItem, R.pipe(parseInt, R.objOf(unit)))}/>
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

function DateControl({editing, field, item, setItem, label}) {
    const defaultValue = item[field]
    console.log('defaultValue', defaultValue)
    label = label ?? field
    return <div className="field is-horizontal column">
        <div className="field-label">
            <label className="label">{label}</label>
        </div>
        <div className="field-body">
            <div className="field">
                {editing ? <p className="control is-expanded has-icons-left">
                    <input className="input is-small" type="date" placeholder={label}
                           defaultValue={defaultValue} onChange={setItemByEvent('start', item, setItem)}/>
                    <span className="icon is-small is-left"><FaStepBackward/></span>
                </p> : <p className="control">{defaultValue}</p>}
            </div>
        </div>
    </div>
}

const FIELD_DURATION = 'duration'

export function Item({index, columns, value, update, rm}) {
    const [editing, setEditing] = useState(!value)
    const [folded, setFolded] = useState(true)
    const cleanDuration = R.cond([
        [R.isNil, R.identity],
        [R.propSatisfies(R.isNil, FIELD_DURATION), R.assoc(FIELD_DURATION, DEFAULT_DURATION)],
        [R.propSatisfies(R.is(Number), FIELD_DURATION), R.over(R.lensProp(FIELD_DURATION), months => ({months}))],
        [R.T, R.identity],
    ])
    const hasDurationColumn = R.any(R.propEq('name', FIELD_DURATION))(columns)
    const clean = hasDurationColumn ? cleanDuration : R.identity
    const cleaned = clean(value)
    // console.log('Cleaned', value, 'to', cleaned)
    const [item, setItem] = useState(cleaned)

    function add() {
        console.log('List add', item)
        update(item)
    }

    function save() {
        console.log('Item set', item)
        setEditing(false)
        update(item)
    }

    function cancel() {
        console.log('Item cancel', item, cleaned)
        setEditing(false)
        setItem(cleaned)
    }

    const durationControl = DurationControl(item, setItem)
    const td = (type, editing) => durationControl[type]?.[editing] ?? ((defaultValue, key) => editing
        ? <input type={type} className="input is-small" defaultValue={defaultValue}
                 onChange={setItemByEvent(key, item, setItem)}/>
        : defaultValue)
    const opTd = <div key={`td${index}`} className="column">
        {item ?
            <div className="field has-addons">
                {editing ?
                    <div className="control">
                        <button className="button is-small" onClick={save} title={'保存'}>
                            <FaSave/>
                        </button>
                        <button className="button is-small" onClick={cancel} title="取消">
                            <FaStrikethrough/>
                        </button>
                    </div> :
                    <div className="control">
                        <button className="button is-small" onClick={() => setEditing(true)} title={'编辑'}>
                            <FaEdit/>
                        </button>
                    </div>
                }
                <div className="control">
                    <button className="button is-small" onClick={() => rm(item.id)} title={'删除'}><FaTrash/></button>
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
        {td(c.type, editing)(item?.[c.key], c.key)}</div>)
    const tr = <section className="panel-block columns">
        {mainCells}
        {opTd}
    </section>
    if (folded)
        return tr
    return <section>
        {tr}
        <div className="columns card">
            <DateControl editing={editing} item={item} setItem={setItem} field="start" label="开始"/>
            <DateControl editing={editing} item={item} setItem={setItem} field="end" label="结束"/>
        </div>
    </section>
}
