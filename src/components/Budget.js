import Kpi from './budget/Kpi'
import List from './budget/List'
import {useList} from './budget/useList'
import * as R from 'ramda'

function Liability() {
    const [liabilities, setLiabilities] = useList('default', 'current', 'liabilities')
    return <List title="负债" hint="不断从你口袋掏钱出来" items={liabilities} setItems={setLiabilities}
                 columns={[{title: '条目', type: 'text'}, {title: '总数', type: 'number'}, {title: '已还', type: 'number'}]}/>
}

const AMOUNT = '数额'

function Incomes() {
    const [items, setItems] = useList('default', 'current', 'incomes')
    //条目	数额	周期
    return <List title="收入" hint="每月" items={items} setItems={setItems}
                 columns={[{title: '条目', type: 'text'}, {title: AMOUNT, type: 'number'}, {title: '周期', type: 'text'}]}/>
}

function Expenses() {
    const [items, setItems] = useList('default', 'current', 'expenses')
    //条目	数额	周期
    return <List title="支出" hint="每月" items={items} setItems={setItems}
                 columns={[{title: '条目', type: 'text'}, {title: AMOUNT, type: 'number'}, {title: '周期', type: 'text'}]}/>
}

function Budget() {
    const [assets, setAssets] = useList('default', 'current')
    const [expenses] = useList('default', 'current', 'expenses')
    return (
        <div>
            <div className="level is-mobile">
                <div className="level-item has-text-centered">
                    <Kpi value={`0/${R.sum(expenses.map(e => e[AMOUNT]))}`}/>
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
            {/*<div className=" field is-grouped is-grouped-multiline">*/}
            {/*    <div className=" field has-addons control">*/}
            {/*        <p className=" control is-expanded">*/}
            {/*            <input id="ver" className="input is-small"/>*/}
            {/*        </p>*/}
            {/*        <p className=" control">*/}
            {/*            <button type=" submit" className=" button is-info is-small">*/}
            {/*                分支*/}
            {/*            </button>*/}
            {/*        </p>*/}
            {/*    </div>*/}
            {/*    <div className=" control">*/}
            {/*        <button className="button is-small">*/}
            {/*            导出*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*    <div className="control">*/}
            {/*        <button className=" button is-small">*/}
            {/*            导入*/}
            {/*        </button>*/}
            {/*        <input id="file-input" type=" file" name=" name" style={{display: 'none'}}/>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    )
}

export default Budget
