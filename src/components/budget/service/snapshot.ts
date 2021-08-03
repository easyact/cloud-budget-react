import {BUDGET_SNAPSHOT, Event, snapshot} from '../../es/lib/es'
import {Budget, BUDGET_KEYS, budgetAdditionMonoid} from '../Model'
import {Either} from 'fp-ts/Either'
import * as R from 'ramda'
import {parseISO} from 'date-fns'

export const budgetSnapshot = (es: Event[]): Either<string, BUDGET_SNAPSHOT<Budget>> =>
    snapshot(updateState, es)

function updateState(initial: BUDGET_SNAPSHOT<Budget>, e: Event): BUDGET_SNAPSHOT<Budget> {
    const {user: {id}, to: {version}} = e
    const versions = initial.get(id) ?? new Map<string, Budget>()
    const budget = versions.get(version) ?? {}
    const updatedBudget = updateBudget(e, budget)
    return initial.set(id, versions.set(version, updatedBudget))
}

function getAt(e: Event) {
    return e.at ? parseISO(e.at) : undefined
}

function updateBudget(e: Event, budget: Budget): Budget {
    // console.log('updateBudget', e, budget)
    switch (e.type) {
        case 'IMPORT_BUDGET':
            return importBudget(budget, e.payload, getAt(e))
        case 'PUT_ITEM':
            const {payload} = e
            return importBudget(budget, {[payload.type]: [payload]}, getAt(e))
        case 'DELETE_ITEM':
            const {payload: {from, id: deletingId}} = e
            const others = R.filter(({id}) => id !== deletingId)
            return R.over<Budget, any>(R.lensProp(from), R.unless(R.isNil, others))(budget)
        default:
            return budget
    }
}

const importBudget = (budget: Budget, importing: Budget, at = new Date()) => {
    const clean = (budget: Budget, list = 'assets') => R.over<Budget, any>(
        R.lensProp(list),
        R.pipe(R.defaultTo([]), R.map(({start = at, amount, ...item}) => ({
            ...item, start, amount: R.when(s => R.type(s) === 'String', parseFloat, amount)
        })))
    )(budget)
    const y = BUDGET_KEYS.reduce(clean, importing)
    // console.log('importBudget', y)
    return budgetAdditionMonoid.concat(budget, y)
}
