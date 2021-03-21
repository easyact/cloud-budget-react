import * as R from 'ramda'

const kpi = budget => ({
    expenses: R.pipe(
        R.defaultTo([]),
        R.map(R.prop('amount')),
        R.sum
    )(budget.expenses)
})

export default function reducer(state, action) {
    console.log('reducing', state, action)
    switch (action.type) {
        case 'CREATE_ITEM':
            return { /* unchanged */}
        case 'UPDATE_BUDGET_REQUEST':
            return {
                ...state,
                isLoading: true,
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
                budget: budget,
                kpi: kpi(budget)
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
