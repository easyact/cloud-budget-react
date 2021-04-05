import * as R from 'ramda'

const kpi = R.pipe(
    R.prop('expenses'),
    // log('prop expenses'),
    R.defaultTo([]),
    // log('defaultTo'),
    R.map(R.prop('amount')),
    // log('props'),
    R.sum,
    // log('sum'),
    R.assoc('expenses', R.__, {})
)

export default function reducer(state, action) {
    console.log('reducing', action, state)
    switch (action.type) {
        case 'USER_AUTHED':
            return {...state, email: action.payload, authing: true}
        case 'ADD_BUDGETS':
            return {
                ...state,
                budget: action.payload,
                saving: true,
            }
        case 'UPDATE_BUDGET':
            return {
                ...state,
                budget: action.payload,
                saving: true,
            }
        case 'DELETE_ITEM':
            return { /* unchanged */}

        case 'FETCH_BUDGET_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: false,
                budget: {}
            }

        case 'FETCH_BUDGET_SUCCESS':
            const budget = action.payload
            return {
                ...state,
                isLoading: false,
                // saving: false,
                budget: budget,
                kpi: kpi(budget)
            }
        case 'SAVED_BUDGET':
            return {
                ...state,
                saving: false,
                authing: false
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
