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
import {isAfter, isBefore, parseISO} from 'date-fns'

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
                <p className="control">
                    <input defaultValue={value} className="input is-small min-5" type="number"
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
        )
    }
}

function DateControl({editing, field, item, setItem, label}) {
    const defaultValue = item[field]
    // console.log('defaultValue', defaultValue)
    label = label ?? field
    return <div className="field is-horizontal">
        <div className="field-label is-small">
            <label className="label">{label}</label>
        </div>
        <div className="field-body">
            <div className="field">
                {editing ? <p className="control is-expanded has-icons-left">
                    <input className="input is-small" type="date" placeholder={label}
                           defaultValue={defaultValue} onChange={setItemByEvent(field, item, setItem)}/>
                    <span className="icon is-small is-left"><FaStepBackward/></span>
                </p> : <p className="control">{defaultValue}</p>}
            </div>
        </div>
    </div>
}

const FIELD_DURATION = 'duration'
const lensDuration = R.lensProp(FIELD_DURATION)
const defaultDuration = R.over(lensDuration, R.defaultTo(DEFAULT_DURATION))
const LENS_RELATED_ID = R.lensProp('relatedId')

const ALWAYS_NULL = R.always(null)

export function Item({index, columns, value, update, rm, detail = ALWAYS_NULL}) {
    // console.log(index, columns, value)
    const [editing, setEditing] = useState(!value)
    const [folded, setFolded] = useState(true)
    const cleanDuration = R.cond([
        [R.isNil, R.always({duration: DEFAULT_DURATION})],
        [R.propSatisfies(R.isNil, FIELD_DURATION), R.assoc(FIELD_DURATION, DEFAULT_DURATION)],
        [R.propSatisfies(R.is(Number), FIELD_DURATION), R.over(lensDuration, months => ({months}))],
        [R.T, R.identity],
    ])
    const hasDurationColumn = R.any(R.propEq('key', FIELD_DURATION))(columns)
    const clean = hasDurationColumn ? cleanDuration : R.identity
    const cleaned = clean(value)
    // console.log('Cleaned', value, 'to', cleaned, columns)

    const [item, setItem] = useState(cleaned)

    // console.log(item)
    function add() {
        console.log('List add', item)
        update(defaultDuration(item))

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

    const today = new Date()
    const unstarted = isBefore(today, parseISO(item?.start))
    const overdue = isAfter(today, parseISO(item?.end))
    let tags = []
    unstarted && tags.push('未来')
    overdue && tags.push('过期')
    const durationControl = DurationControl(item, setItem)
    const td = (type, editing) => durationControl[type]?.[editing] ?? ((defaultValue, key) => editing
        ? <input type={type} className="input is-small min-5" defaultValue={defaultValue}
                 onChange={setItemByEvent(key, item, setItem)}/>
        : <p>{defaultValue}{key === 'name' && tags.map(t => <span className="tag" key={t}>{t}</span>)}</p>)
    const opTd = <div key={`td${index}`} className="column">
        {value ?
            <div className="field has-addons">
                {editing && <div className="control">
                    <button className="button is-small" onClick={cancel} title="取消">
                        <FaStrikethrough/>
                    </button>
                </div>}
                {editing && <div className="control">
                    <button className="button is-small" onClick={save} title={'保存'}>
                        <FaSave/>
                    </button>
                </div>}
                {editing || <div className="control">
                    <button className="button is-small" onClick={() => setEditing(true)} title={'编辑'}>
                        <FaEdit/>
                    </button>
                </div>}
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
    // console.log(isBefore(today, parseISO(item?.start)), parseISO(item?.start), item?.start, today)
    // console.log(isAfter(today, parseISO(item?.end)), parseISO(item?.end), item?.end, today)
    const tr = <section
        className={`panel-block columns ${unstarted && 'unstarted'} ${overdue && 'overdue'}`}>
        {mainCells}
        {opTd}
    </section>
    if (folded) {
        return tr
    }
    return <section>
        {tr}
        <div className="card">
            <div className="field is-horizontal">
                <div className="field-label is-small">
                    <label className="label">开始结束时间</label>
                </div>
                <div className="field-body">
                    <DateControl editing={editing} item={item} setItem={setItem} field="start" label="开始"/>
                    <DateControl editing={editing} item={item} setItem={setItem} field="end" label="结束"/>
                </div>
            </div>
            {detail(editing, item.relatedId, id => setItem(R.set(LENS_RELATED_ID, id, item)))}
        </div>
    </section>
}
