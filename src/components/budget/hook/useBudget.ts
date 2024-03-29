import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {exec, getBudget, getBudgetFromEvents, getEvents, sync} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as E from 'fp-ts/Either'
import {BEvent, DBEventStore} from '../../es/lib/eventStore'
import useUser from './useUser'
import {pipe} from 'fp-ts/lib/function'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'ramda'

const eventStore = new DBEventStore()
export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {uid, isAuthenticated, error, isLoading} = useUser(eventStore)
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer, {
        uid,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        eventStore,
        apiBase: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn`,
        syncNeeded: true,
        showHistory: false,
        history: [],
        lastEventId: null,
    })
    const notifyError = <E>(payload: E) => {
        // alert(JSON.stringify(payload))
        dispatch({type: 'FETCH_BUDGET_ERROR', payload})
    }
    const {cmd, apiBase, syncNeeded, lastEventId}: BudgetState = state
    // console.log('useBudgeting', uid, version, state, eventStore)
    useEffect(function userChange() {
        if (error) {
            dispatch({type: 'FETCH_BUDGET_ERROR', payload: error})
            return
        }
        dispatch({type: 'USER_CHANGE', payload: uid})
    }, [error, uid])
    useEffect(function doSync() {
        if (isAuthenticated && syncNeeded) {
            console.log('useBudget.syncing', version, uid, isAuthenticated, syncNeeded)
            pipe(
                sync(apiBase, uid),
                RTE.chain(() => getBudget(uid, version))
            )(eventStore)().then(
                E.fold(notifyError, payload => dispatch({type: 'SYNC_SUCCESS', payload})))
        }
    }, [apiBase, uid, isAuthenticated, syncNeeded, version])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.execCmd', cmd, version, eventStore)
        exec(uid, cmd)(eventStore)()
            .then(E.fold(notifyError, payload => dispatch({type: 'CMD_SUCCESS', payload})))
    }, [version, cmd, uid])
    useEffect(function load() {
        if (isLoading) return
        pipe(
            getEvents(uid),
            RTE.chain(events => pipe(events,
                lastEventId ? R.filter((e: BEvent) => (e.id || 0) <= lastEventId) : R.identity,
                filtered => getBudgetFromEvents(filtered, uid, version),
                RTE.map(R.set(R.lensProp('events'), events))
            )),
        )(eventStore)()
            .then(E.fold(notifyError, payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload})))
    }, [version, uid, isLoading, lastEventId])
    return [state, dispatch]
}
