import {Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'
import {BudgetRepositoryLocalStorageV2} from '../repository/interpreter/BudgetRepositoryLocalStorageV2'
import {useAuth0} from '@auth0/auth0-react'

export default function useBudget(version: string): [ReducerState<any>, Dispatch<ReducerAction<any>>] {
    const {user = {email: 'default'}, isAuthenticated, isLoading} = useAuth0()
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
    const {repo, budget, saving, email} = state
    if (email !== user.email && !isLoading && isAuthenticated) dispatch({type: 'USER_AUTHED', payload: user.email})
    console.log('useBudgeting', email, version, state)
    useEffect(() => {
        // console.log('useBudget.useEffect1', repo, user, version)
        if (isLoading) return
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
    }, [repo, email, version, isLoading])
    useEffect(() => {
        // console.log('useBudget.useEffect2', 'setBudget', saving, user, version, budget)
        if (isLoading) return
        if (!saving) return
        repo.setBudget(email, version, budget)().then(E.fold(
            e => dispatch({
                type: 'FETCH_BUDGET_ERROR',
                payload: e
            }),
            () => dispatch({type: 'SAVED_BUDGET'})
        ))
    }, [repo, email, version, budget, saving, isLoading])
    return [state, dispatch]
}
