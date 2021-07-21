import * as R from 'ramda'
import {Item} from './Item'
import {timesPerMonth} from './util'
import {track} from './service/analytics'

export const initValue = {text: '空', number: 0, duration: {months: 1}}

function sum(items, columns) {
    const amountKey = columns[1].key
    const unitKey = 'duration'
    // console.log(items)
    const numbers = items.map(item => item[amountKey] * timesPerMonth(item[unitKey]))
    return R.sum(numbers)
}

export default function List(
    {
        name = 'assets',
        title = '资产',
        hint = '',
        columns = [
            {title: '项目', type: 'text', key: 'name'},
            {title: '价值', type: 'number', key: 'amount'},
            {title: '首付', type: 'number', key: 'downPayment'}],
        items = [],
        dispatch,
    }
) {
    function put(item) {
        const type = 'PUT_ITEM'
        track(type)
        dispatch({type, payload: {...item, type: name}})
    }

    function rm(id) {
        console.log('rm', id)
        const type = 'DELETE_ITEM'
        track(type)
        dispatch({type, payload: {id, from: name}})
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
                    <Item key={`${name}-add`} index={-1} columns={columns} update={put}/>
                    <tr>
                        <td>
                            总{title}
                        </td>
                        <td>
                            ¥{sum(items, columns).toFixed(2)}
                        </td>
                        <td>
                        </td>
                    </tr>
                    </tfoot>
                    <tbody>
                    {items.map((value, index) =>
                        <Item key={index} index={index} columns={columns} value={value} update={put} rm={rm}/>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
