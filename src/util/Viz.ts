import getDaysInYear from 'date-fns/fp/getDaysInYear'
import {range} from 'fp-ts/NonEmptyArray'
import addDays from 'date-fns/addDays'
import * as R from 'ramda'
import {Semigroup} from 'fp-ts/lib/Semigroup'

export const myAddDays = R.curry(addDays)

export function dateRange(start = new Date(), days = getDaysInYear(start)): Date[] {
    const addDaysToStart = myAddDays(start)
    return range(0, days).map(addDaysToStart)
}

export const semigroupDailyData: Semigroup<any> = {
    concat: (x: any, y: any) => R.mergeWith(R.add, x, y)
}
