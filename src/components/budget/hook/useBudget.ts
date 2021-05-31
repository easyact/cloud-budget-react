import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {useAuth0} from '@auth0/auth0-react'
import {exec, getBudgetE, uploadEvents} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as io from 'fp-ts/IO'
import log from '../../log'
import {v4} from 'uuid'
import {DBEventStore} from '../../es/lib/eventStore'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import {getItem, setItem} from 'fp-ts-local-storage'
import {pipe} from 'fp-ts/lib/function'

export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const uidKey = 'user.id'
    const uid: string = pipe(
        getItem(uidKey),
        io.map(O.getOrElse(v4)),
        io.chainFirst(s => setItem(uidKey, s))
    )()
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer, {
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        eventStore: new DBEventStore(),
        apiUrl: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn/`
    })
    const {user, isAuthenticated, isLoading} = useAuth0()
    const {eventStore, cmd, apiUrl}: BudgetState = state
    console.log('useBudgeting', uid, user, version, state, eventStore)
    useEffect(function login() {
        if (!isAuthenticated) return
        uploadEvents(uid, apiUrl)(eventStore)().then(E.fold(
            payload => dispatch({type: 'FETCH_BUDGET_ERROR', payload}),
            log('upload success!')))
    }, [apiUrl, uid, isAuthenticated, eventStore])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.setting', cmd, version, eventStore)
        exec(uid, cmd)(eventStore)()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [eventStore, version, cmd, uid])
    useEffect(function load() {
        if (isLoading) return
        console.log('useBudget.loading', version, isLoading, eventStore)
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        TE.getOrElse(() => T.of({}))(getBudgetE(uid, version)(eventStore))()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [eventStore, version, isLoading, uid])
    return [state, dispatch]
}
