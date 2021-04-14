import {Monoid} from 'fp-ts/Monoid'
import {findIndex, map, modifyAt, reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import R from 'ramda'

export class Budget {
    assets?: Item[] = []
    liabilities?: Item[] = []
}

const NULL = new Budget()
export const BudgetAdditionMonoid: Monoid<Budget> = {
    concat: (x, y) => pipe(NULL, R.keys,
        map(k => R.objOf(k)(listAdditionMonoid.concat(x[k] ?? [], y[k] ?? []))),
        R.mergeAll),
    empty: new Budget()
}

const defaultDate = new Date(0)
const lastModifyAt = (item: Item) => item.lastModifiedDate ?? defaultDate
// bindTo
export const listAdditionMonoid: Monoid<Item[]> = {
    concat: (x, y) => reduce(x, (r, item: Item) => pipe(
        r,
        findIndex(i => i.id === item.id),
        O.chain(index => pipe(r, modifyAt(index, i => lastModifyAt(i) > lastModifyAt(item) ? i : item))),
        // O.chain(f => f(r)),
        O.getOrElse(() => r)
    ))(y),
    empty: []
}

export interface Item {
    id?: String
    name: String
    amount: number
    lastModifiedDate?: Date
}
