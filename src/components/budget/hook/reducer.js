import * as R from 'ramda'
import {track} from '../../../util/analytics'

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
    track(action.type, action.payload)
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
            const budgetState = action.payload
            return {
                ...state,
                isLoading: false,
                // saving: false,
                error: undefined,
                // budget,
                kpi: kpi(budgetState.budget),
                showHistory: false,
                ...budgetState,
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
                ...action.payload,
                syncNeeded: false,
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

        case 'SHOW_HISTORY':
            return {
                ...state,
                showHistory: action.payload
            }

        case 'SET_LAST_EVENT_ID':
            return {
                ...state,
                showHistory: false,
                lastEventId: action.payload,
            }

        default:
            return {
                ...state, cmd: {
                    user: {id: state.uid}, to: {version: state.version},
                    error: undefined, ...action
                }
            }
    }
}
