import {BudgetEsService} from './budgetEsService'

describe('curd', () => {
    let service: BudgetEsService
    beforeEach(() => {
        service = new BudgetEsService('t')
    })
    test('add item', () => {
        const budget = service.getBudget('0')
        expect(budget).toEqual({})
        const item = {name: 'TI', type: 'assets'}
        const addedBudget = service.exec({
            type: 'PUT_ITEM',
            payload: {to: 'assets', item},
            user: {email: ''},
            to: {version: ''}
        })
        expect(addedBudget.assets).toEqual([{...item, id: expect.anything()}])
    })
})
