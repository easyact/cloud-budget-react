import {dateRange, myAddDays} from './Viz'
import parseISO from 'date-fns/parseISO'

test('dateRange', () => {
    const start = new Date(2000, 0, 1)
    const next = new Date(2000, 0, 2)
    const myAddDaysFn = myAddDays(start)
    console.log(myAddDaysFn)
    expect(myAddDaysFn(0)).toEqual(start)
    expect(myAddDaysFn(1)).toEqual(next)
    const a = dateRange(start, 1)
    expect(a).toEqual([start, next])
})
test('iso', () => {
    expect(isNaN(parseISO(undefined))).toEqual(true)
})
test('and', () => {
    expect(null && 123).toEqual(null)
    expect(undefined && 123).toEqual(undefined)
    expect("a" && 123).toEqual(123)
    expect("a" && new Date(0)).toEqual(new Date(0))
})
