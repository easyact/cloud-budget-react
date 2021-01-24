import {FaEdit, FaPlus, FaSave, FaTrash} from 'react-icons/all'
import {useRef} from 'react'
import * as R from 'ramda'

function Item(index, columns, {
    editing = false,
    ...value
}, update, rm) {
    // console.log('Item', index, columns, editing, value, update, rm)
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
                        <button className="button is-small" onClick={update}><FaSave/></button>
                    </div>) : (
                    <div>
                        <div className="control">
                            <button className="button is-small" onClick={() => editing = true}>
                                <FaEdit/>
                            </button>
                        </div>
                        <div className="control">
                            <button className="button is-small" onClick={rm}><FaTrash/></button>
                        </div>
                    </div>
                )}
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
    // const adding = useRef(columns.reduce((previousValue, {title, type}) =>
    //     bind(title, () => initValue[type])(previousValue), {}))
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

    function rm() {
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
                    {items.map((value, index) => Item(index, columns, value, update, rm))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
