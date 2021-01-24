import {FaEdit, FaPlus, FaSave, FaTrash} from 'react-icons/all'
import {useRef, useState} from 'react'
import * as R from 'ramda'
import {flow} from 'fp-ts/es6/function'

export function Item({index, columns, value, update, rm}) {
    const [editing, setEditing] = useState(false)
    return <tr key={index}>
        {columns.map(c => (
            <td key={c.title + index}>{editing ?
                <input type={c.type} className="input is-small" defaultValue={value[c.title]}/> :
                value[c.title]}
            </td>
        ))}

        <td key={`td${index}`}>
            <div className="field has-addons">
                {editing ? (
                    <div className="control">
                        <button className="button is-small" onClick={flow(
                            () => setEditing(false),
                            update)}><FaSave/>
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

const initValue = {text: '空', number: 0}
export default function List({
                                 title = '资产',
                                 hint = '产生被动收入',
                                 columns = [
                                     {title: '项目', type: 'text'},
                                     {title: '价值', type: 'number'},
                                     {title: '首付', type: 'number'}],
                                 items = [],
                                 setItems = arr => items = arr
                             }) {
    const adding = {}
    for (const c of columns) {
        const initValueElement = initValue[c.type]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        adding[c.title] = useRef(initValueElement)
    }

    function add() {
        console.log('List add', adding)
        setItems([...items, R.mapObjIndexed(r => r.current.value)(adding)])
    }

    function update() {

    }

    function rm(e) {
        console.log('rm', e)
        setItems(R.remove(e, 1, items))
    }

    // let sum = 0;
    return (
        <div className="panel">
            <p className="panel-heading">{title}<small className="has-text-grey">{hint}</small></p>
            <div className="panel-block table-container">
                <table className="table is-hoverable is-fullwidth is-narrow">
                    <thead>
                    <tr>
                        {columns.map(c => (<th key={c.title}>{c.title}</th>))}
                        <th/>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        {columns.map(c => (
                            <td key={c.title}>
                                <input type={c.type} className="input is-small" ref={adding[c.title]}/>
                            </td>
                        ))}
                        <th>
                            <div className="field has-addons">
                                <div className="control">
                                    <button className="button is-small is-success" onClick={add}>
                                        <FaPlus/>
                                    </button>
                                </div>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <td>
                            总{title}
                        </td>
                        <td>
                            ¥{0}
                        </td>
                        <td>
                        </td>
                    </tr>
                    </tfoot>
                    <tbody>
                    {items.map((value, index) => (
                        <Item key={index} index={index} columns={columns} value={value} update={update} rm={rm}/>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
