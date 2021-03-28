import * as R from 'ramda'
import log from '../log'

const kpi = R.pipe(
    R.prop('expenses'),
    log('prop expenses'),
    R.defaultTo([]),
    log('defaultTo'),
    R.map(R.prop('amount')),
    log('props'),
    R.sum,
    log('sum'),
    R.assoc('expenses', R.__, {})
)

export default function reducer(state, action) {
    console.log('reducing', state, action)
    switch (action.type) {
        case 'CREATE_ITEM':
            return { /* unchanged */}
        case 'UPDATE_BUDGET_REQUEST':
            return {
                ...state,
                budget: action.payload,
                isLoading: true,
            }
        case 'DELETE_ITEM':
            return { /* unchanged */}

        case 'FETCH_BUDGET_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: false,
                // budget: {}
            }

        case 'FETCH_BUDGET_SUCCESS':
            const budget = action.payload
            console.log('reducer', 'FETCH_BUDGET_SUCCESS', budget)
            return {
                ...state,
                isLoading: false,
                saving: true,
                budget: budget,
                kpi: kpi(budget)
            }
        case 'SAVED_BUDGET':
            console.log('reducer', 'SAVED_BUDGET')
            return {
                ...state,
                saving: false
            }

        case 'FETCH_BUDGET_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload
            }

        default:
            return state
    }
}
