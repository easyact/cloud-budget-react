import {listAdditionMonoid} from './Model'
import {timesPerMonth} from './util'

describe('listAdditionMonoid', () => {
    test('with id', () => {
        const actual = listAdditionMonoid.concat([{name: '1'}], [{id: '2', name: '2'}])
        expect(actual).toEqual([{name: '1'}, {id: '2', name: '2'}])
    })
    test('no id', () => {
        const actual = listAdditionMonoid.concat([{name: '1'}], [{name: '2'}])
        expect(actual).toEqual([{name: '1'}, {name: '2'}])
    })
})

describe('List', () => {
    test('howManyPerMonth', () => {
        expect(timesPerMonth({weeks: 1, days: 2}, new Date(2021, 1, 1))).toEqual(28 / 9)
    })
})
