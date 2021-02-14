import Kpi from './budget/Kpi'
import List from './budget/List'
import {useList} from './budget/useList'

function Liability() {
    const [liabilities, setLiabilities] = useList('default', 'current', 'liabilities')
    return <List title="负债" hint="不断从你口袋掏钱出来" items={liabilities} setItems={setLiabilities}
                 columns={[{title: '条目', type: 'text'}, {title: '总数', type: 'number'}, {title: '已还', type: 'number'}]}/>
}

function Statement() {
    return null
}

function Budget() {
    const [asserts, setAsserts] = useList('default', 'current')
    return (
        <div>
            <div className="level is-mobile">
                <div className="level-item has-text-centered">
                    <Kpi/>
                </div>
                {/*<div className="level-item has-text-centered">*/}
                {/*    <Progress/>*/}
                {/*</div>*/}
            </div>
            <div className="columns">
                <fieldset className="column">
                    <div className="panel">
                        <List items={asserts} setItems={setAsserts}/>
                    </div>
                    <div className="panel">
                        <Liability/>
                    </div>
                </fieldset>
                <fieldset className="column">
                    <div className="panel">
                        <Statement/>
                    </div>
                    <div className=" panel">
                        <Statement title=" 支出"/>
                    </div>
                </fieldset>
            </div>
            <div className=" field is-grouped is-grouped-multiline">
                <div className=" field has-addons control">
                    <p className=" control is-expanded">
                        <input id="ver" className="input is-small"/>
                    </p>
                    <p className=" control">
                        <button type=" submit" className=" button is-info is-small">
                            分支
                        </button>
                    </p>
                </div>
                <div className=" control">
                    <button className="button is-small">
                        导出
                    </button>
                </div>
                <div className="control">
                    <button className=" button is-small">
                        导入
                    </button>
                    <input id="file-input" type=" file" name=" name" style={{display: 'none'}}/>
                </div>
            </div>
        </div>
    )
}

export default Budget
