import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {useAuth0} from '@auth0/auth0-react'
import {exec, getBudgetE, migrateEventsToUser, sync} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as O from 'fp-ts/Option'
import {Option} from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as RTE from 'fp-ts/ReaderTaskEither'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import {IO} from 'fp-ts/IO'
import log from '../../log'
import {DBEventStore, EventStore} from '../../es/lib/eventStore'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import {getItem, setItem} from 'fp-ts-local-storage'
import {pipe} from 'fp-ts/lib/function'

const uidKey = 'user.id'
const getUser = (): IO<Option<string>> => getItem(uidKey)
const setUser = (user: string): IO<void> => setItem(uidKey, user)

// function notRegistered() {
//     return O.isNone(getUser()())
// }

function getA(email: string, localUser: Option<string>): ReaderTaskEither<EventStore, string, any> {
    return O.fold(
        () => migrateEventsToUser(email),
        RTE.of
    )(localUser)
}

export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {user: {email}, isAuthenticated} = useAuth0()
    const localUser: Option<string> = getUser()()
    const uid = pipe(
        O.fromNullable(email),
        O.fold(
            () => O.fold(
                () => RTE.of<EventStore, string, string>('default'),
                (u: string) => RTE.of(u)
            )(localUser),
            () => pipe(
                O.fold(
                    () => migrateEventsToUser(email),
                    RTE.of
                )(localUser),
                RTE.chainFirst(() => RTE.fromIO(setUser(email)))
            )
        )
    )
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer, {
        uid,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        eventStore: new DBEventStore(),
        apiUrl: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn/`
    })
    const {eventStore, cmd, apiUrl}: BudgetState = state
    console.log('useBudgeting', uid, version, state, eventStore)
    useEffect(function login() {
        if (!isAuthenticated) return
        dispatch({type: 'LOGGED_IN', uid})
        const readerTaskEither = pipe(
            localUser,
            RTE.fromIO,
            RTE.chain(O.fold(() => {
                setItem(uidKey, uid)()
                return migrateEventsToUser(uid)
            }, RTE.of)),
            RTE.chain(() => sync(uid, apiUrl)),
        )
        readerTaskEither(eventStore)().then(E.fold(
            payload => dispatch({type: 'FETCH_BUDGET_ERROR', payload}),
            log('upload success!')
        ))
    }, [apiUrl, uid, isAuthenticated, eventStore])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.setting', cmd, version, eventStore)
        exec(uid, cmd)(eventStore)()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [eventStore, version, cmd, uid])
    useEffect(function load() {
        // if (isLoading) return
        console.log('useBudget.loading', version, eventStore)
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        TE.getOrElse(() => T.of({}))(getBudgetE(uid, version)(eventStore))()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [eventStore, version, uid])
    return [state, dispatch]
}
