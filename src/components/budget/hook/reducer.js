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
    // alert(`${JSON.stringify(action)}`)
    console.log('reducing', action, state)
    const r = handle(state, action)
    console.log('reduced', r)
    return r
}

function handle(state, action) {
    switch (action.type) {
        case 'USER_CHANGE':
            return {
                ...state,
                uid: action.payload,
                error: undefined,
            }
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
                error: undefined,
                budget,
                kpi: kpi(budget),
            }
        case 'CMD_SUCCESS':
            return {
                ...state,
                syncNeeded: true,
                budget: action.payload,
                kpi: kpi(action.payload),
                error: undefined,
            }
        case 'SYNC_SUCCESS':
            return {
                ...state,
                syncNeeded: false,
                budget: action.payload,
                error: undefined,
            }

        case 'FETCH_BUDGET_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload
            }

        case 'CLOSE_ERROR':
            return {
                ...state,
                error: undefined
            }

        default:
            return {...state, cmd: {user: {id: state.uid}, to: {version: state.version},
                    error: undefined, ...action}}
    }
}
