import getDaysInYear from 'date-fns/fp/getDaysInYear'
import {range} from 'fp-ts/Array'
import addDays from 'date-fns/addDays'
import * as R from 'ramda'
import log from '../components/log'

export const myAddDays = R.curry(addDays)

export function dateRange(start = new Date(), days = getDaysInYear(start)) {
    const addDaysToStart = myAddDays(start)
    return log('range')(range(0, days)).map(addDaysToStart)
}
