import {BudgetEsService} from './budgetEsService'
import {Budget} from '../Model'
import {MemEventStore} from '../../es/lib/eventStore'

describe('curd', () => {
    // const cmd = {user: {id: 't'}, to: {version: '0'}}
    const item = {name: 'TI', type: 'assets', amount: 100}
    let service: BudgetEsService
    beforeEach(async () => {
        service = new BudgetEsService('t', new MemEventStore())
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
            user: {id: 't'},
            to: {version: '0'}
        })
        expectIncludedItem(await addedBudget)
        const newBudget = service.getBudget('0')
        expect(newBudget).not.toEqual({})
        expectIncludedItem(await newBudget)
        const addedBudget2 = await service.exec({
            type: 'PUT_ITEM',
            payload: {name: 'another', type: 'assets'},
            user: {id: 't'},
            to: {version: '0'}
        })
        expect(addedBudget2.assets).toEqual([{...item, id: expect.anything()}, {
            name: 'another',
            type: 'assets',
            id: expect.anything()
        }])
    })

    test('update item', async () => {
        await service.importBudget('t', {assets: [item]})
        const budget = await service.getBudget('0')
        expect(budget).not.toEqual({})
        expectIncludedItem(budget)
        const newItem = {...budget.assets[0], name: 'changed'}
        const updated = await service.exec({
            type: 'PUT_ITEM',
            payload: newItem,
            user: {id: 't'},
            to: {version: '0'}
        })
        expect(updated.assets).toEqual([newItem])
    })
    test('delete item', async () => {
        await service.importBudget('t', {assets: [item]})
        const budget = await service.getBudget('0')
        expect(budget).not.toEqual({})
        expectIncludedItem(budget)
        const updated = await service.exec({
            type: 'DELETE_ITEM',
            payload: {from: 'assets', id: budget.assets[0].id},
            user: {id: 't'},
            to: {version: '0'}
        })
        expect(updated.assets).toEqual([])
    })
    // test('login', async () => {
    //     await service.exec({type: 'IMPORT_BUDGET', ...cmd, payload: {assets: [item]}})
    //     // TODO mock fetch
    //     const updated = service.login()
    //     expect(updated.assets).toEqual([])
    // })
})
