import {Monoid} from 'fp-ts/Monoid'
import {findIndex, map, modifyAt, reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as R from 'ramda'

// import {Foldable} from 'fp-ts/Foldable'

export class Budget {
    assets?: Item[] = []
    liabilities?: Item[] = []
}

export interface Item {
    id?: String
    name: String
    amount: number
    lastModifiedDate?: Date
}

const NULL = new Budget()
export const budgetAdditionMonoid: Monoid<Budget> = {
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
        findIndex(i => !!i.id && !!item.id && i.id === item.id),
        O.chain(index => pipe(r, modifyAt(index, i => lastModifyAt(i) > lastModifyAt(item) ? i : item))),
        // O.chain(f => f(r)),
        O.getOrElse(() => [...r, item])
    ))(y),
    empty: []
}

// export const budgetFoldable: Foldable<Budget> = {
//     URI: undefined,
//     foldMap<M>(M: Monoid<M>): <A>(fa: HKT<Budget, A>, f: (a: A) => M) => M {
//         return function (p1: HKT<Budget, A>, p2: (a: A) => M) {
//             return undefined
//         }
//     },
//     reduce<A, B>(fa: HKT<Budget, A>, b: B, f: (b: B, a: A) => B): B {
//         return undefined
//     },
//     reduceRight<A, B>(fa: HKT<Budget, A>, b: B, f: (a: A, b: B) => B): B {
//         return undefined
//     }
// }
