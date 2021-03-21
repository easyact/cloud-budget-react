import {useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'

export default function useBudget(repo, user, version) {
    console.log('useBudgeting', user, version)
    const [state, dispatch] = useReducer(reducer,
        () => ({budget: {}, error: false, isLoading: false, kpi: {expenses: 0}}))
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
    }, [repo, user, version])
    return [state, dispatch]
}
