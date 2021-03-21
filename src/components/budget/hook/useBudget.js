import {useEffect, useReducer} from 'react'
import reducer from '../reducer'
import {BudgetRepositoryLocalStorage} from '../repository/interpreter/BudgetRepositoryLocalStorage'
import {BudgetServiceInterpreter} from '../service/interpreter/BudgetServiceInterpreter'
import {flow} from 'fp-ts/es6/function'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'

export default function useBudget(user, version) {
    const [state, dispatch] = useReducer(reducer,
        () => ({budget: {}, error: false, isLoading: false, kpi: {}}))
    const repo = new BudgetRepositoryLocalStorage()
    const service = new BudgetServiceInterpreter()
    useEffect(() => {
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        flow(repo.getBudget(user, version), TE.fold(e => T.of(dispatch({
            type: 'FETCH_BUDGET_ERROR',
            payload: e
        }), budget => dispatch({
            type: 'FETCH_BUDGET_SUCCESS',
            payload: budget
        }))))().then()
    })
    return [state, dispatch]
}
