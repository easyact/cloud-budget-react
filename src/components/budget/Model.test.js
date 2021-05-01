import {listAdditionMonoid} from './Model'

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
