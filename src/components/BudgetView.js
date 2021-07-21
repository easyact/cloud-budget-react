import List from './budget/List'
import useBudget from './budget/hook/useBudget'
import EXAMPLE from './budget/service/example.json'
import {Link} from 'react-router-dom'

const AMOUNT = '数额'

function BudgetView() {
    const [{budget, error}, dispatch] = useBudget('current')

    function importBudget(e) {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsText(file, 'UTF-8')

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            const content = readerEvent.target.result // this is the content!
            console.log(content)
            const payload = JSON.parse(content)
            dispatch({type: 'IMPORT_BUDGET', payload})
        }
    }

    if (error === 'none') return <div>
        <div className="hero">
            <section className="hero-body block">
                <p className="subtitle">第一次使用?</p>
                <p className="title">是否需要在示例的基础上创建预算?</p>
                <div className="buttons">
                    <button className="button is-large is-success"
                            onClick={() => dispatch({type: 'IMPORT_BUDGET', payload: EXAMPLE})}>导入示例预算
                    </button>
                    <Link to="/sync" className="button is-light is-large">先登录, 从远程获取数据</Link></div>
            </section>
        </div>
    </div>

    return (
        <div>
            {error ? <div className="notification is-danger">
                <button className="delete" onClick={() => dispatch({type: 'CLOSE_ERROR'})}/>
                {error}
            </div> : <div/>}
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
                        <List items={budget.assets} dispatch={dispatch} hint="带来被动收入"/>
                    </div>
                    <div className="panel">
                        <List name={'liabilities'} title="负债" hint="从口袋掏钱出去" items={budget.liabilities}
                              dispatch={dispatch}
                              columns={[{title: '负债', type: 'text', key: 'name'}, {
                                  title: '总数',
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '已还', type: 'number', key: 'amortized'}]}/>
                    </div>
                </fieldset>
                <fieldset className="column">
                    <div className="panel">
                        <List name={'incomes'} title="收入" items={budget.incomes}
                              dispatch={dispatch}
                              columns={[{title: '收入', type: 'text', key: 'name'}, {
                                  title: AMOUNT,
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '周期', type: 'duration', key: 'duration'}]}/>
                    </div>
                    <div className=" panel">
                        <List name={'expenses'} title="支出" items={budget.expenses}
                              dispatch={dispatch}
                              columns={[{title: '支出', type: 'text', key: 'name'}, {
                                  title: AMOUNT,
                                  type: 'number',
                                  key: 'amount'
                              }, {title: '周期', type: 'duration', key: 'duration'}]}/>
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
                {/*<div className=" control">*/}
                {/*    <button className="button is-small">*/}
                {/*        导出*/}
                {/*    </button>*/}
                {/*</div>*/}
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

export default BudgetView
