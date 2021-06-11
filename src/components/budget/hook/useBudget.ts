import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {exec, getBudgetE, sync} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as E from 'fp-ts/Either'
import {DBEventStore} from '../../es/lib/eventStore'
import useUser from './useUser'
import {pipe} from 'fp-ts/lib/function'
import * as RTE from 'fp-ts/ReaderTaskEither'

const eventStore = new DBEventStore()
export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {uid, isAuthenticated, error} = useUser(eventStore)
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer, {
        uid,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        eventStore,
        apiBase: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn`,
        syncNeeded: true
    })
    const notifyError = <E>(payload: E) => dispatch({type: 'FETCH_BUDGET_ERROR', payload})
    const {cmd, apiBase, syncNeeded}: BudgetState = state
    // console.log('useBudgeting', uid, version, state, eventStore)
    useEffect(function userChange() {
        if (error)
            return dispatch({type: 'FETCH_BUDGET_ERROR', payload: error})
        dispatch({type: 'USER_CHANGE', payload: uid})
    }, [error, uid])
    useEffect(function whenLoggedIn() {
        if (!(isAuthenticated && syncNeeded)) return
        console.log('useBudget.syncing', uid, isAuthenticated, syncNeeded)
        pipe(sync(apiBase, uid), RTE.chain(() => getBudgetE(uid, version)))(eventStore)()
            .then(E.fold(notifyError, payload => dispatch({type: 'SYNC_SUCCESS', payload})))
    }, [apiBase, uid, isAuthenticated, syncNeeded, version])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.setting', cmd, version, eventStore)
        exec(uid, cmd)(eventStore)()
            .then(payload => dispatch({type: 'CMD_SUCCESS', payload}))
    }, [version, cmd, uid])
    useEffect(function load() {
        console.log('useBudget.loading', uid, version, eventStore)
        // dispatch({type: 'FETCH_BUDGET_REQUEST'})
        getBudgetE(uid, version)(eventStore)()
            .then(E.fold(notifyError, payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload})))
    }, [version, uid])
    return [state, dispatch]
}
