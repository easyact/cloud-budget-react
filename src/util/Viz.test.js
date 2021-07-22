import {dateRange, myAddDays} from './Viz'

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
