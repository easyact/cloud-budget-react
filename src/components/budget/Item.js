import {useRef, useState} from 'react'
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
import {formatISO} from 'date-fns'

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
                        <input defaultValue={value} className="input is-small" type="number" onChange={event => {
                            current.value[unit] = parseInt(event.target.value)
                            console.log('DurationEditor inputting', unit, current.value[unit], current, fields)
                        }}/>
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
    const [folded, setFolded] = useState(true)
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
    if (!folded) return <section className="">
        {tr}
        <div className="panel-block">
            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <label className="label">开始</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control is-expanded has-icons-left">
                            <input className="input" type="date" placeholder="开始时间"
                                   defaultValue={log('format')(formatISO(value.start, {representation: 'date'}))}/>
                            <span className="icon is-small is-left">
                                <FaStepBackward/>
                            </span>
                        </p>
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

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label"></div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field is-expanded">*/}
            {/*            <div className="field has-addons">*/}
            {/*                <p className="control">*/}
            {/*                     <a className="button is-static">*/}
            {/*                         +44*/}
            {/*                     </a>*/}
            {/*                </p>*/}
            {/*                <p className="control is-expanded">*/}
            {/*                    <input className="input" type="tel" placeholder="Your phone number"/>*/}
            {/*                </p>*/}
            {/*            </div>*/}
            {/*            <p className="help">Do not enter the first zero</p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label is-normal">*/}
            {/*        <label className="label">Department</label>*/}
            {/*    </div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field is-narrow">*/}
            {/*            <div className="control">*/}
            {/*                <div className="select is-fullwidth">*/}
            {/*                    <select>*/}
            {/*                        <option>Business development</option>*/}
            {/*                        <option>Marketing</option>*/}
            {/*                        <option>Sales</option>*/}
            {/*                    </select>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label">*/}
            {/*        <label className="label">Already a member?</label>*/}
            {/*    </div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field is-narrow">*/}
            {/*            <div className="control">*/}
            {/*                <label className="radio">*/}
            {/*                    <input type="radio" name="member"/>*/}
            {/*                    Yes*/}
            {/*                </label>*/}
            {/*                <label className="radio">*/}
            {/*                    <input type="radio" name="member"/>*/}
            {/*                    No*/}
            {/*                </label>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label is-normal">*/}
            {/*        <label className="label">Subject</label>*/}
            {/*    </div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field">*/}
            {/*            <div className="control">*/}
            {/*                <input className="input is-danger" type="text"*/}
            {/*                       placeholder="e.g. Partnership opportunity"/>*/}
            {/*            </div>*/}
            {/*            <p className="help is-danger">*/}
            {/*                This field is required*/}
            {/*            </p>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label is-normal">*/}
            {/*        <label className="label">Question</label>*/}
            {/*    </div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field">*/}
            {/*            <div className="control">*/}
            {/*                <textarea className="textarea" placeholder="Explain how we can help you"/>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div className="field is-horizontal">*/}
            {/*    <div className="field-label">*/}
            {/*    </div>*/}
            {/*    <div className="field-body">*/}
            {/*        <div className="field">*/}
            {/*            <div className="control">*/}
            {/*                <button className="button is-primary">*/}
            {/*                    Send message*/}
            {/*                </button>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    </section>
// </div>
    return tr
}
