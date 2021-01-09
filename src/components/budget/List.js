import {FaPlus} from "react-icons/all";
import {useState} from "react"

export default function List({
                                 title = '资产',
                                 hint = '产生被动收入',
                                 columns = [
                                     {title: '项目', type: 'text'},
                                     {title: '价值', type: 'number'},
                                     {title: '首付', type: 'number'}]
                             }) {
    const [items, setItems] = useState(() => []);

    function add() {
        setItems([...items, {}])
    }

    // let sum = 0;
    return (
        <div className="panel">
            <p className="panel-heading">{title}<small className="has-text-grey">{hint}</small></p>
            <div className="panel-block table-container">
                <table className="table is-hoverable is-fullwidth is-narrow">
                    <thead>
                    <tr>
                        {columns.map(c => (<th>{c.title}</th>))}
                        <th/>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        {columns.map(c => (
                            <td>
                                <input type={c.type} className="input is-small"/>
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
                    {items.map(({editing = false, value = 'test'}) => (
                        <tr>
                            {columns.map(c => {
                                let td = editing ? <input type={c.type} className="input is-small"/> : value;
                                return (
                                    <td>{td}</td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
