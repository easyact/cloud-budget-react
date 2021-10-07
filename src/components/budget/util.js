import getDaysInYear from 'date-fns/getDaysInYear'
import getDaysInMonth from 'date-fns/getDaysInMonth'
import {reduce} from 'fp-ts/Array'
import * as R from 'ramda'
import {formatISOWithOptions} from 'date-fns/fp'

const days = {
    'years': getDaysInYear,
    'months': getDaysInMonth,
    'weeks': () => 7,
    'days': () => 1,
}
export const timesPerMonth = (duration, today = new Date()) => {
    if (!duration) return 1
    const es = Object.entries(duration)
    const _days = reduce(0, (s, [unit, n]) => s + days[unit](today) * n)(es)
    return getDaysInMonth(today) / _days
}

export const monthlyAmountCalc = (unitKey, amountKey) => item => item[amountKey] * timesPerMonth(item[unitKey])

export const formatDate = R.unless(R.isNil, formatISOWithOptions({representation: 'date'}))
