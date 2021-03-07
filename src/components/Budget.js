import Kpi from './budget/Kpi'
import List from './budget/List'
import {useList} from './budget/useList'
import * as R from 'ramda'
import {useBudget} from './budget/useBudget'

function Liability() {
    const [liabilities, setLiabilities] = useList('default', 'current', 'liabilities')
    return <List title="负债" hint="不断从你口袋掏钱出来" items={liabilities} setItems={setLiabilities}
                 columns={[{title: '条目', type: 'text', key: 'name'}, {title: '总数', type: 'number', key: 'amount'}, {title: '已还', type: 'number', key: 'amortized'}]}/>
}

const AMOUNT = '数额'

function Incomes() {
    const [items, setItems] = useList('default', 'current', 'incomes')
    //条目	数额	周期
    return <List title="收入" hint="每月" items={items} setItems={setItems}
                 columns={[{title: '条目', type: 'text', key: 'name'}, {title: AMOUNT, type: 'number', key: 'amount'}, {title: '周期', type: 'text', key: 'duration'}]}/>
}

function Expenses() {
    const [items, setItems] = useList('default', 'current', 'expenses')
    //条目	数额	周期
    return <List title="支出" hint="每月" items={items} setItems={setItems}
                 columns={[{title: '条目', type: 'text', key: 'name'}, {title: AMOUNT, type: 'number', key: 'amount'}, {title: '周期', type: 'text', key: 'duration'}]}/>
}

function Budget() {
    const [assets, setAssets] = useList('default', 'current')
    const [expenses] = useList('default', 'current', 'expenses')
    const {setBudget} = useBudget('default', 'current')

    function importBudget(e) {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsText(file, 'UTF-8')

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            const content = readerEvent.target.result // this is the content!
            console.log(content)
            setBudget(JSON.parse(content))
        }
    }

    return (
        <div>
            <div className="level is-mobile">
                <div className="level-item has-text-centered">
                    {/*R.sum(expenses.map(e => e[AMOUNT]))*/}
                    <Kpi value={`0/${R.pipe(R.defaultTo([]), R.map(e => e[AMOUNT]), R.sum)(expenses)}`}/>
                </div>
                {/*<div className="level-item has-text-centered">*/}
                {/*    <Progress/>*/}
                {/*</div>*/}
            </div>
            <div className="columns">
                <fieldset className="column">
                    <div className="panel"><List items={assets} setItems={setAssets}/></div>
                    <div className="panel"><Liability/></div>
                </fieldset>
                <fieldset className="column">
                    <div className="panel"><Incomes/></div>
                    <div className=" panel"><Expenses/></div>
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
