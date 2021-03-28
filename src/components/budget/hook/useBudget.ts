import {Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'
import {BudgetRepositoryLocalStorageV2} from '../repository/interpreter/BudgetRepositoryLocalStorageV2'

export default function useBudget(user: string, version: string)
    : [ReducerState<any>, Dispatch<ReducerAction<any>>] {
    const [state, dispatch] = useReducer<Reducer<any, any>>(reducer,
        {
            repo: new BudgetRepositoryLocalStorageV2(),
            budget: {},
            error: false,
            isLoading: false,
            kpi: {expenses: 0},
            saving: false
        })
    console.log('useBudgeting', user, version, state)
    const {repo, budget, saving} = state
    useEffect(() => {
        console.log('useBudget.useEffect1', repo, user, version)
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        repo.getBudget(user, version)().then(E.fold(
            e => dispatch({
                type: 'FETCH_BUDGET_ERROR',
                payload: e
            }),
            budget => dispatch({
                type: 'FETCH_BUDGET_SUCCESS',
                payload: budget
            })
        ))
    }, [repo, user, version])
    useEffect(() => {
        console.log('useBudget.useEffect2', 'setBudget', saving, user, version, budget)
        if (!saving) return
        repo.setBudget(user, version, budget)().then(E.fold(
            e => dispatch({
                type: 'FETCH_BUDGET_ERROR',
                payload: e
            }),
            () => dispatch({type: 'SAVED_BUDGET'})
        ))
    }, [repo, user, version, budget, saving])
    return [state, dispatch]
}
