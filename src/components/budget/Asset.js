export function Asset() {
    let title = "资产";
    let item = {disabled: false};
    let sum = 0;
    return (
        <div>
            <p className="panel-heading">{title}<small className="has-text-grey">产生被动收入</small></p>
            <div className="panel-block table-container">
                <table className="table is-hoverable is-fullwidth is-narrow">
                    <thead>
                    <tr>
                        <th>项目</th>
                        <th>价值</th>
                        <th>首付</th>
                        <th/>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        <td>
                            <input className="input is-small"/>
                        </td>
                        <td>
                            <input type="number" className="input is-small"/>
                        </td>
                        <td>
                            <input type="number" className="input is-small"/>
                        </td>
                        <th>
                            <div className="field has-addons">
                                <div className="control">
                                    <button className="button is-small is-success" onClick="add()">
                                        <i className="fas fa-plus">
                                        </i>
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
                            {sum | "currency:'CNY':'symbol-narrow':'.0-0'"}
                        </td>
                        <td>
                        </td>
                    </tr>
                    </tfoot>
                    <tbody>
                    <tr>
                        <td>
                            <input className={(item.disabled ? 'is-static' : null) + " input is-small"}/>
                        </td>
                        <td>
                            <input className={(item.disabled ? 'is-static' : null) + " input is-small"}/>
                        </td>
                        <td>
                            <input type="number" className={(item.disabled ? 'is-static' : null) + " input is-small"}/>
                        </td>
                        <td>
                            <div className=" field has-addons">
                                <div className=" control">
                                    <button className=" button is-small"><i className=" fas fa-save">
                                    </i></button>
                                </div>
                                <div className=" control">
                                    <button className=" button is-small" onClick={" item.enable()"}>
                                        <i className="fas fa-edit">
                                        </i>
                                    </button>
                                </div>
                                <div className="control">
                                    <button className="button is-small" onClick={"rm(item)"}>
                                        <i className="fas fa-trash">
                                        </i>
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
