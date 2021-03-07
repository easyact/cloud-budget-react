import {FaPlus} from 'react-icons/all'
import {useRef} from 'react'
import * as R from 'ramda'
import {Item} from './Item'

export const initValue = {text: '空', number: 0}
export default function List({
                                 title = '资产',
                                 hint = '产生被动收入',
                                 columns = [
                                     {title: '项目', type: 'text', key: 'name'},
                                     {title: '价值', type: 'number', key: 'amount'},
                                     {title: '首付', type: 'number', key: 'downPayment'}],
                                 items = [],
                                 setItems = arr => items = arr
                             }) {
    const adding = {}
    for (const c of columns) {
        const initValueElement = initValue[c.type]
        // eslint-disable-next-line react-hooks/rules-of-hooks
        adding[c.key] = useRef(initValueElement)
    }

    function add() {
        console.log('List add', adding)
        setItems([...items, R.mapObjIndexed(r => r.current.value)(adding)])
        columns.map(c => c.key).forEach(t => adding[t].current.value = null)
    }

    function update(id, v) {
        console.log('update', id, v)
        setItems(R.update(id, v, items))
    }

    function rm(id) {
        console.log('rm', id)
        setItems(R.remove(id, 1, items))
    }

    // let sum = 0;
    return (
        <div className="panel">
            <p className="panel-heading">{title}<small className="has-text-grey">{hint}</small></p>
            <div className="panel-block table-container">
                <table className="table is-hoverable is-fullwidth is-narrow is-striped is-narrow">
                    <thead>
                    <tr>
                        {columns.map(c => (<th key={c.key}>{c.title}</th>))}
                        <th/>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        {columns.map(c => (
                            <td key={c.key}>
                                <input type={c.type} className="input is-small" ref={adding[c.key]}/>
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
                            ¥{R.sum(items.map(item => item[columns[1].key]))}
                        </td>
                        <td>
                        </td>
                    </tr>
                    </tfoot>
                    <tbody>
                    {items.map((value, index) =>
                        <Item key={index} index={index} columns={columns} value={value} update={update} rm={rm}/>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
