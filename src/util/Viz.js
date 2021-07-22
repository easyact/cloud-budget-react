import getDaysInYear from 'date-fns/fp/getDaysInYear'
import {range} from 'fp-ts/Array'
import addDays from 'date-fns/addDays'
import * as R from 'ramda'

export const myAddDays = R.curry(addDays)

export function dateRange(start = new Date(), days = getDaysInYear(start)) {
    const addDaysToStart = myAddDays(start)
    return range(0, days).map(addDaysToStart)
}
