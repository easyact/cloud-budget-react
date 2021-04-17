import {Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {BudgetRepositoryLocalStorageV2} from '../repository/interpreter/BudgetRepositoryLocalStorageV2'
import {useAuth0} from '@auth0/auth0-react'
import {pipe} from 'fp-ts/function'

export default function useBudget(version: string): [ReducerState<any>, Dispatch<ReducerAction<any>>] {
    const defaultUser = 'default'
    const {user = {email: defaultUser}, isAuthenticated, isLoading} = useAuth0()
    const [state, dispatch] = useReducer<Reducer<any, any>, undefined>(reducer, user.email, email => (
        {
            email,
            budget: {},
            error: false,
            isLoading: false,
            kpi: {expenses: 0},
            saving: false,
            repo: new BudgetRepositoryLocalStorageV2()
        }))
    const {repo, budget, saving, email, authing} = state
    if (email !== user.email && !isLoading && isAuthenticated) dispatch({type: 'USER_AUTHED', payload: user.email})
    console.log('useBudgeting', email, version, state)
    useEffect(() => {
        console.log('useBudget.loading', repo, email, version, authing)
        if (authing) return
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        repo.getBudget(email, version)().then(E.fold(
            e => {
                // if ('none' === e) return dispatch({
                //     type: 'FETCH_BUDGET_SUCCESS',
                //     payload: {}
                // })
                dispatch({
                    type: 'FETCH_BUDGET_ERROR',
                    payload: e
                })
            },
            budget => dispatch({
                type: 'FETCH_BUDGET_SUCCESS',
                payload: budget
            })
        ))
    }, [repo, email, version, authing])
    useEffect(() => {
        if (!authing) return
        pipe(
            repo.getBudget(defaultUser, version),
            TE.map(budget => dispatch({type: 'ADD_BUDGETS', payload: budget})),
            TE.chain(() => repo.setBudget(defaultUser, version, {}))
        )().then(E.fold(
            e => console.error(`请空default错误: ${e}`),
            () => console.log(`请空default成功`)
        ))
    }, [repo, email, version, budget, authing])
    useEffect(() => {
        // console.log('useBudget.useEffect2', 'setBudget', saving, user, version, budget)
        if (!saving) return
        repo.setBudget(email, version, budget)().then(E.fold(
            e => alert(`保存错误: ${e}`),
            () => dispatch({type: 'SAVED_BUDGET'})
        ))
    }, [repo, email, version, budget, saving])
    return [state, dispatch]
}
