import {BudgetEsService} from './budgetEsService'
import {Budget} from '../Model'

describe('curd', () => {
    const cmd = {user: {email: ''}, to: {version: ''}}
    const item = {name: 'TI', type: 'assets'}
    let service: BudgetEsService
    beforeEach(() => {
        service = new BudgetEsService('t')
        const budget = service.getBudget('0')
        expect(budget).toEqual({})
    })

    function expectIncludedItem(addedBudget: Budget) {
        expect(addedBudget.assets).toEqual([{...item, id: expect.anything()}])
    }

    test('add item', () => {
        const addedBudget = service.exec({
            type: 'PUT_ITEM',
            payload: {to: 'assets', item},
            user: {email: 't'},
            to: {version: '0'}
        })
        expectIncludedItem(addedBudget)
        const newBudget = service.getBudget('0')
        expect(newBudget).not.toEqual({})
        expectIncludedItem(newBudget)
    })
    test('update item', () => {
        service.exec({type: 'IMPORT_BUDGET', ...cmd, payload: {assets: [item]}})
        const budget = service.getBudget('0')
        expect(budget).not.toEqual({})
        expectIncludedItem(budget)
        const newItem = {...budget.assets[0], name: 'changed'}
        const updated = service.exec({
            type: 'PUT_ITEM',
            payload: {to: 'assets', item: newItem},
            user: {email: ''},
            to: {version: ''}
        })
        expect(updated.assets).toEqual([newItem])
    })
})
