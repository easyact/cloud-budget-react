import List from './budget/List'
import useBudget from './budget/hook/useBudget'
import EXAMPLE from './budget/service/example.json'
import {Link} from 'react-router-dom'
import {StreamViz} from './StreamViz'
import {useEffect, useState} from 'react'
import {getEvents} from './budget/service/budgetEsService'
import * as E from 'fp-ts/Either'
import {budgetSnapshot} from './budget/service/snapshot'
import {pipe} from 'fp-ts/function'
import * as R from 'ramda'
import log from './log'
import {FaAngleDown} from 'react-icons/all'

const AMOUNT = '数额'

function History({eventStore, uid, dispatch}) {
    const [events, setEvents] = useState([])
    const [err, setErr] = useState()
    const [last, setLast] = useState()
    useEffect(function settingEvents() {
        // TODO 这里得用state
        getEvents(uid)(eventStore)().then(E.fold(setErr, setEvents))
    }, [eventStore, uid])
    useEffect(function previewVersion() {
        console.log(' history deps', events, last, uid,)

        function setBudget(payload) {
            return dispatch({type: 'FETCH_BUDGET_SUCCESS', payload})
        }

        if (!last) {
            console.log('Ignore history preview')
            return
        }
        pipe(events,
            R.filter(e => e.id <= last),
            budgetSnapshot,
            E.map(m => m?.get(uid)?.get('current')),
            E.map(log('History snapshot')),
            E.fold(setErr, setBudget)
        )
    }, [dispatch, events, last, uid])
    if (err)
        return <p className="message is-danger">{err}</p>
    return <div className="dropdown-content history">
        {events.map((e, i) => <div className="dropdown-item" key={i}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={() => setLast(e.id)}>{e.type} 分支: {e.to?.version}
                <div className="ea-content">{JSON.stringify(e.payload)}</div>
                {/*    */}
            </a>
        </div>)}
    </div>
}

function BudgetView() {
    const [{budget, error, eventStore, uid, showHistory}, dispatch] = useBudget('current')

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
                <p>钱越少越要精打细算, 因为你的未来部分取决于你目前的资源分配.</p>
                <p>财务报告包含资产/负债/收入/支出部分.</p>
                <p>记账太繁琐, 做好每月预算, 然后月底看看实际和预算的大致偏差, 就能把大部分问题都暴露了. </p>
                <p>然后针对问题调整重要项目的投入比例, 你的未来便掌握在你自己的手中. </p>
                <div className="buttons">
                    <button className="button is-large is-success"
                            onClick={() => dispatch({type: 'IMPORT_BUDGET', payload: EXAMPLE})}>导入示例预算
                    </button>
                    <Link to="/sync" className="button is-light is-large">先登录, 从远程获取数据</Link></div>
            </section>
        </div>
    </div>

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
        <StreamViz budget={budget} height={window.innerHeight / 2}/>
        <div className="buttons has-addons is-right">
            {/*<button className="button" onClick={() => setShowHistory(!showHistory)}>修改历史</button>*/}
            <div className="dropdown is-right is-active">
                <div className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu6"
                            onClick={() => dispatch({type: 'SHOW_HISTORY', payload: !showHistory})}>
                        <span>修改历史</span>
                        <FaAngleDown/>
                    </button>
                </div>
                <div className="dropdown-menu" id="dropdown-menu6" role="menu" style={{width: '20rem'}}>
                    {showHistory && <History eventStore={eventStore} uid={uid} dispatch={dispatch}/>}
                </div>
            </div>
        </div>

        <div className="columns">
            <div className="column">
                <List name={'incomes'} title="收入" items={budget.incomes}
                      dispatch={dispatch}
                      columns={[{title: '收入', type: 'text', key: 'name'}, {
                          title: AMOUNT,
                          type: 'number',
                          key: 'amount'
                      }, {title: '周期', type: 'duration', key: 'duration'}]}/>
                <List name={'expenses'} title="支出" items={budget.expenses}
                      dispatch={dispatch}
                      columns={[{title: '支出', type: 'text', key: 'name'}, {
                          title: AMOUNT,
                          type: 'number',
                          key: 'amount'
                      }, {title: '周期', type: 'duration', key: 'duration'}]}/>
            </div>
            <div className="column">
                <List items={budget.assets} dispatch={dispatch} hint="带来被动收入"/>
                <List name={'liabilities'} title="负债" hint="从口袋掏钱出去" items={budget.liabilities}
                      dispatch={dispatch}
                      columns={[{title: '负债', type: 'text', key: 'name'}, {
                          title: '总数',
                          type: 'number',
                          key: 'amount'
                      }, {title: '已还', type: 'number', key: 'amortized'}]}/>
            </div>
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
}

export default BudgetView
