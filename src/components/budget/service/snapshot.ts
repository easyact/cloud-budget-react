import {BUDGET_SNAPSHOT, Event, snapshot} from '../../es/lib/es'
import {Budget, budgetAdditionMonoid} from '../Model'
import {Either} from 'fp-ts/Either'
import * as R from 'ramda'

export const budgetSnapshot = (es: Event<Budget>[]): Either<string, BUDGET_SNAPSHOT<Budget>> =>
    snapshot(updateState, es)

function updateState(initial: BUDGET_SNAPSHOT<Budget>, e: Event<Budget>): BUDGET_SNAPSHOT<Budget> {
    const {user: {email}, to: {version}} = e
    const versions = initial.get(email) ?? new Map<string, Budget>()
    const budget = versions.get(version) ?? {}
    const updatedBudget = updateBudget(e, budget)
    return initial.set(email, versions.set(version, updatedBudget))
}

function updateBudget(e: Event<Budget>, budget: Budget): Budget {
    switch (e.type) {
        case 'IMPORT_BUDGET':
            return importBudget(budget, e.payload)
        case 'PUT_ITEM':
            const {payload} = e
            return importBudget(budget, {[payload.type]: [payload]})
        case 'DELETE_ITEM':
            const {payload: {from, id: deletingId}} = e
            return R.over(R.lensProp(from), R.filter(({id}) => id !== deletingId))(budget)
        default:
            return budget
    }
}

const importBudget = (budget: Budget, importing: Budget) => budgetAdditionMonoid.concat(budget, importing)
