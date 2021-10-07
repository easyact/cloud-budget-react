import List from './budget/List'
import useBudget from './budget/hook/useBudget'
import EXAMPLE from './budget/service/example.json'
import {Link} from 'react-router-dom'
import {StreamViz} from './StreamViz'
import {FaAngleDown, FaPlus} from 'react-icons/all'
import {useRef, useState} from 'react'
import {Switch} from './Switch'
import {History} from './History'
import * as R from 'ramda'
import {monthlyAmountCalc} from './budget/util'

const AMOUNT = '数额'
const DURATION = 'duration'

// const monthlyAddition = item => monthlyAmountCalc(DURATION, 'amount', item).toFixed(0) + '/月'
const monthlyAddition = item => mainValue => {
    const calc = monthlyAmountCalc(DURATION, 'amount', item)
    return mainValue === calc ? null : calc.toFixed(0) + '/月'
}

// const monthlyAddition = monthlyAmountCalc(DURATION, 'amount')

function BudgetView() {
    const [state, dispatch] = useBudget('current')
    const {budget, error, showHistory, events, version, versions = new Map()} = state
    const newVersion = useRef()
    const hiding = useState()
    const overlayingState = useState(false)

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
                <p>钱越少越要精打细算, 你的未来取决于你目前的资源分配.</p>
                <p>财务报告包含资产/负债/收入/支出部分.</p>
                <p>做好每月预算, 然后月底看看实际和预算的大致偏差, 校准预算. </p>
                <p>然后按生活目标调整各项支出的投入比例, 未来便掌握在你自己的手中. </p>
                <div className="buttons">
                    <button className="button is-large is-success"
                            onClick={() => dispatch({type: 'IMPORT_BUDGET', payload: EXAMPLE})}>导入示例预算
                    </button>
                    <Link to="/sync" className="button is-light is-large">先登录, 从远程获取数据</Link></div>
            </section>
        </div>
    </div>

    const relatedForm = (relatedList, listName = '资产') => (editing, relatedId, setRelatedId) => {
        // console.log(l)
        const name = R.pipe(R.find(R.propEq('id', relatedId)), R.propOr('无', 'name',))(relatedList)
        return <div className="field is-horizontal">
            <div className="field-label is-small">
                <label className="label">关联{listName}</label>
            </div>
            <div className="field-body">
                <div className="field">
                    {editing ? <div className="control">
                        <div className="select is-fullwidth is-small">
                            <select value={relatedId} onChange={e => setRelatedId(e.target.value)}>
                                <option>无</option>
                                {relatedList.map(item => <option
                                    key={`assoc-${item.id}`}
                                    value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                    </div> : <p className="control"><small>{name}</small></p>}
                </div>
            </div>
        </div>
    }
    return <div>
        {error && <div className="notification is-danger">
            <button className="delete" onClick={() => dispatch({type: 'CLOSE_ERROR'})}/>
            {error}
        </div>}
        <div className="level is-mobile">
            <div className="level-item has-text-centered">
                {/*R.sum(expenses.map(e => e[AMOUNT]))*/}
                {/*<Kpi value={`0/${budget.kpi.expenses}`}/>*/}
            </div>
            {/*<div className="level-item has-text-centered">*/}
            {/*    <Progress/>*/}
            {/*</div>*/}
        </div>
        <nav className="field is-grouped">
            <div className="control">
                <Switch hiding={hiding} overlaying={overlayingState}/>
            </div>
            <div className="control buttons">
                <div className="dropdown is-active">
                    <div className="dropdown-trigger">
                        <button className="button" aria-haspopup="true" aria-controls="dropdown-menu6"
                                onClick={() => dispatch({type: 'SHOW_HISTORY', payload: !showHistory})}>
                            <span>操作历史</span>
                            <FaAngleDown/>
                        </button>
                    </div>
                    <div className="dropdown-menu" id="dropdown-menu6" role="menu" style={{width: '20rem'}}>
                        {showHistory && <History events={events} dispatch={dispatch}/>}
                    </div>
                </div>
            </div>
        </nav>
        <div className="tabs">
            <ul>
                <li>版本</li>
                {[...(versions.keys())].map(v =>
                    <li key={`ver${v}`} className={v === version ? 'is-active' : undefined}>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a onClick={() => dispatch({type: 'SELECT_VERSION', payload: v})}>{v}</a>
                    </li>)}
                <li className="field has-addons">
                    <div className="control">
                        <input className="input is-small" ref={newVersion} placeholder="新版本名称"/>
                    </div>
                    <div className="control">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a className="button is-info is-small" onClick={() => {
                            dispatch({
                                type: 'NEW_VERSION',
                                to: {version: newVersion.current.value},
                                payload: version
                            })
                            newVersion.current.value = null
                        }}><FaPlus/></a>
                    </div>
                </li>
            </ul>
        </div>
        {hiding[0] || <StreamViz budget={budget} height={window.innerHeight / 2} overlaying={overlayingState[0]}/>}

        <div className="columns">
            <div className="column">
                <List name={'incomes'} title="收入" items={budget.incomes}
                      dispatch={dispatch}
                      columns={[{title: '收入', type: 'text', key: 'name'}
                          , {
                              title: AMOUNT, type: 'number', key: 'amount',
                              addition: monthlyAddition
                          }
                          , {title: '周期', type: DURATION, key: DURATION}]}
                      detail={relatedForm(budget.assets)}
                />
                <List name={'expenses'} title="支出" items={budget.expenses}
                      dispatch={dispatch}
                      columns={[{title: '支出', type: 'text', key: 'name'}
                          , {
                              title: AMOUNT,
                              type: 'number',
                              key: 'amount',
                              addition: monthlyAddition
                          }
                          , {title: '周期', type: DURATION, key: DURATION}]}
                      detail={relatedForm(budget.liabilities, '负债')}
                />
            </div>
            <div className="column">
                <List items={budget.assets} dispatch={dispatch} hint="带来被动收入"/>
                <List name={'liabilities'} title="负债" hint="从口袋掏钱出去" items={budget.liabilities}
                      dispatch={dispatch}
                      columns={[{title: '负债', type: 'text', key: 'name'}, {
                          title: '总数',
                          type: 'number',
                          key: 'amount'
                      }, {title: '已还期数/总期数', type: 'text', key: 'amortized'}]}/>
            </div>
        </div>
        <div className="field is-grouped is-grouped-multiline">
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
}

export default BudgetView
