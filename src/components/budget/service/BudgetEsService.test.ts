import {BudgetEsService} from './budgetEsService'
import {Budget} from '../Model'

describe('curd', () => {
    const cmd = {user: {email: 't'}, to: {version: '0'}}
    const item = {name: 'TI', type: 'assets'}
    let service: BudgetEsService
    beforeEach(async () => {
        service = new BudgetEsService('t'/*, new DBEventStore()*/)
        const budget = await service.getBudget('0')
        expect(budget).toEqual({})
    })

    function expectIncludedItem(addedBudget: Budget) {
        expect(addedBudget.assets).toEqual([{...item, id: expect.anything()}])
    }

    test('add item', async () => {
        const addedBudget = service.exec({
            type: 'PUT_ITEM',
            payload: item,
            user: {email: 't'},
            to: {version: '0'}
        })
        expectIncludedItem(await addedBudget)
        const newBudget = service.getBudget('0')
        expect(newBudget).not.toEqual({})
        expectIncludedItem(await newBudget)
        const addedBudget2 = await service.exec({
            type: 'PUT_ITEM',
            payload: {name: 'another', type: 'assets'},
            user: {email: 't'},
            to: {version: '0'}
        })
        expect(addedBudget2.assets).toEqual([{...item, id: expect.anything()}, {
            name: 'another',
            type: 'assets',
            id: expect.anything()
        }])
    })
    test('update item', async () => {
        await service.exec({type: 'IMPORT_BUDGET', ...cmd, payload: {assets: [item]}})
        const budget = await service.getBudget('0')
        expect(budget).not.toEqual({})
        expectIncludedItem(budget)
        const newItem = {...budget.assets[0], name: 'changed'}
        const updated = await service.exec({
            type: 'PUT_ITEM',
            payload: newItem,
            user: {email: 't'},
            to: {version: '0'}
        })
        expect(updated.assets).toEqual([newItem])
    })
    test('delete item', async () => {
        await service.exec({type: 'IMPORT_BUDGET', ...cmd, payload: {assets: [item]}})
        const budget = await service.getBudget('0')
        expect(budget).not.toEqual({})
        expectIncludedItem(budget)
        const updated = await service.exec({
            type: 'DELETE_ITEM',
            payload: {from: 'assets', id: budget.assets[0].id},
            user: {email: 't'},
            to: {version: '0'}
        })
        expect(updated.assets).toEqual([])
    })
})
