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

        case 'FETCH_BUDGET_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload
            }

        default:
            state.service.exec(action)
            return state
    }
}
