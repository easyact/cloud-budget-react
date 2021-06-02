import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {exec, getBudgetE, sync} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as E from 'fp-ts/Either'
import {DBEventStore} from '../../es/lib/eventStore'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import useUser from './useUser'

const eventStore = new DBEventStore()
export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {uid, isAuthenticated} = useUser(eventStore)
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer, {
        uid,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        eventStore,
        apiBase: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn/`
    })
    const {cmd, apiBase, syncNeeded}: BudgetState = state
    console.log('useBudgeting', uid, version, state, eventStore)
    useEffect(function loggedIn() {
        if (!isAuthenticated) return
        dispatch({type: 'LOGGED_IN', payload: uid})
    }, [uid, isAuthenticated])
    useEffect(function whenLoggedIn() {
        if (!(isAuthenticated && syncNeeded)) return
        sync(uid, apiBase)(eventStore)().then(E.fold(
            payload => dispatch({type: 'FETCH_BUDGET_ERROR', payload}),
            () => dispatch({type: 'SYNC_SUCCESS'})
        ))
    }, [apiBase, uid, isAuthenticated, syncNeeded])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.setting', cmd, version, eventStore)
        exec(uid, cmd)(eventStore)()
            .then(payload => dispatch({type: 'CMD_SUCCESS', payload}))
    }, [version, cmd, uid])
    useEffect(function load() {
        console.log('useBudget.loading', version, eventStore)
        // dispatch({type: 'FETCH_BUDGET_REQUEST'})
        TE.getOrElse(() => T.of({}))(getBudgetE(uid, version)(eventStore))()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [version, uid])
    return [state, dispatch]
}
