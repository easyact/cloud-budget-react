import * as R from 'ramda'
import {Item} from './Item'
import {monthlyAmountCalc} from './util'
import {track} from '../../util/analytics'

// export const initValue = {text: '空', number: 0, duration: {months: 1}}

const sumFn = columns => R.pipe(
    R.map(monthlyAmountCalc('duration', columns[1].key)),
    R.sum
)

export default function List(
    {
        name = 'assets',
        title = '资产',
        hint = '',
        columns = [
            {title: '资产', type: 'text', key: 'name'},
            {title: '价值', type: 'number', key: 'amount'},
            {title: '首付', type: 'number', key: 'downPayment'}],
        items = [],
        dispatch,
        detail,
    }
) {
    // console.log(name, title, columns, items)
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

    return <div className="panel b-list is-primary">
        <p className="panel-heading">{title}<small className="has-text-warning">{hint}</small></p>
        <section className="panel-block columns th">
            {columns.map(c => <b key={c.key} className="column">{c.title}</b>)}
            <span className="column"/>
        </section>
        {items.map((item, index) =>
            <Item key={`${index}-${Object.entries(item)}`} index={index} columns={columns} value={item} update={put}
                  rm={rm} detail={detail}/>
        )}
        <Item key={`${name}-add`} index={-1} columns={columns} update={put}/>
        <section className="panel-block th">
            <b className="column">
                总{title}
            </b>
            <b className="column">
                ¥{sumFn(columns)(items).toFixed(2)}
            </b>
            {/*<td className="column">*/}
            {/*</td>*/}
        </section>
        {/*<div className="panel-block table-container">*/}
        {/*    <table className="table is-hoverable is-fullwidth is-narrow is-striped is-narrow">*/}
        {/*        <thead>*/}
        {/*        <tr>*/}
        {/*            {columns.map(c => (<th key={c.key}>{c.title}</th>))}*/}
        {/*            <th/>*/}
        {/*        </tr>*/}
        {/*        </thead>*/}
        {/*        <tfoot>*/}
        {/*        <Item key={`${name}-add`} index={-1} columns={columns} update={put}/>*/}
        {/*        <tr>*/}
        {/*            <td>*/}
        {/*                总{title}*/}
        {/*            </td>*/}
        {/*            <td>*/}
        {/*                ¥{sum(items, columns).toFixed(2)}*/}
        {/*            </td>*/}
        {/*            <td>*/}
        {/*            </td>*/}
        {/*        </tr>*/}
        {/*        </tfoot>*/}
        {/*        <tbody>*/}
        {/*        {items.map((value, index) =>*/}
        {/*            <Item key={index} index={index} columns={columns} value={value} update={put} rm={rm}/>*/}
        {/*        )}*/}
        {/*        </tbody>*/}
        {/*    </table>*/}
        {/*</div>*/}
    </div>
}
