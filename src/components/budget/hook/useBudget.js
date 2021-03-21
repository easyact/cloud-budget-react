import {useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'
import {BudgetRepositoryLocalStorageV2} from '../repository/interpreter/BudgetRepositoryLocalStorageV2'

export default function useBudget(user, version) {
    const [state, dispatch] = useReducer(reducer,
        () => ({budget: {}, error: false, isLoading: false, kpi: {}}))
    const repo = new BudgetRepositoryLocalStorageV2()
    useEffect(() => {
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
    })
    return [state, dispatch]
}
