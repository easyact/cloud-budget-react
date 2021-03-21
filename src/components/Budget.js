import List from './budget/List'
import useBudget from './budget/hook/useBudget'

const AMOUNT = '数额'

function Budget({repo}) {
    const [{budget = {}}, dispatch] = useBudget(repo, 'default', 'current')

    function saveBudget(budget) {
        dispatch({type: 'FETCH_BUDGET_SUCCESS', payload: budget})
    }

    function importBudget(e) {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsText(file, 'UTF-8')

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            const content = readerEvent.target.result // this is the content!
            console.log(content)
            saveBudget(JSON.parse(content))
        }
    }

    let updateList = list => items => {
        dispatch({type: 'UPDATE_BUDGET_REQUEST', payload: {...budget, [list]: items}})
    }
    return (
        <div>
            <div className="level is-mobile">
                <div className="level-item has-text-centered">
                    {/*R.sum(expenses.map(e => e[AMOUNT]))*/}
                    {/*<Kpi value={`0/${budget.kpi.expenses}`}/>*/}
                </div>
                {/*<div className="level-item has-text-centered">*/}
                {/*    <Progress/>*/}
                {/*</div>*/}
            </div>
            <div className="columns">
                <fieldset className="column">
                    <div className="panel">
                        <List items={budget.assets} setItems={updateList('assets')}/>
                    </div>
                    <div className="panel">
                        <List title="负债" hint="不断从你口袋掏钱出来" items={budget.liabilities}
                              setItems={updateList('liabilities')}
                              columns={[{title: '条目', type: 'text', key: 'name'}, {
                                  title: '总数',
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '已还', type: 'number', key: 'amortized'}]}/>
                    </div>
                </fieldset>
                <fieldset className="column">
                    <div className="panel">
                        <List title="收入" hint="每月" items={budget.incomes}
                              setItems={updateList('incomes')}
                              columns={[{title: '条目', type: 'text', key: 'name'}, {
                                  title: AMOUNT,
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '周期', type: 'text', key: 'duration'}]}/>
                    </div>
                    <div className=" panel">
                        <List title="支出" hint="每月" items={budget.expenses}
                              setItems={updateList('expenses')}
                              columns={[{title: '条目', type: 'text', key: 'name'}, {
                                  title: AMOUNT,
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '周期', type: 'text', key: 'duration'}]}/>
                    </div>
                </fieldset>
            </div>
            <div className=" field is-grouped is-grouped-multiline">
                {/*<div className=" field has-addons control">*/}
                {/*    <p className=" control is-expanded">*/}
                {/*        <input id="ver" className="input is-small"/>*/}
                {/*    </p>*/}
                {/*    <p className=" control">*/}
                {/*        <button type=" submit" className=" button is-info is-small">*/}
                {/*            分支*/}
                {/*        </button>*/}
                {/*    </p>*/}
                {/*</div>*/}
                <div className=" control">
                    <button className="button is-small">
                        导出
                    </button>
                </div>
                <div className="control">
                    <button className="button is-small" onClick={() => document.getElementById('import-file').click()}>
                        导入
                    </button>
                    <input id="import-file" type="file" name=" name" style={{display: 'none'}} onChange={importBudget}/>
                </div>
            </div>
        </div>
    )
}

export default Budget
