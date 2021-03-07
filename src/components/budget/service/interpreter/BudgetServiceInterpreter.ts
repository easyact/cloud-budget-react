import {BudgetOp, BudgetService} from '../BudgetService'
import {asks} from 'fp-ts/Reader'
import * as T from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import {Option} from 'fp-ts/Option'
import {pipe} from 'fp-ts/function'

enum ItemTypes {
    assets,
    liabilities,
    incomes,
    expenses,
}

export type ItemType = keyof typeof ItemTypes

export class BudgetServiceInterpreter implements BudgetService {
    setBudget = (user: string, version: string, v: any): BudgetOp<void> => asks(repo => repo.setBudget(user, version, v))
    getAsset = (user: string, version: string) => this.getList(user, version, 'assets')
    setAsset = (user: string, version: string, v: any) => this.setList(user, version, 'assets', v)

    getList = (user: string, version: string, name: ItemType): BudgetOp<Option<any>> => asks(repo => pipe(
        repo.getBudget(user, version),
        T.map(O.map(b => b[name]))
    ))

    setList = (user: string, version: string, name: ItemType, v: any = []): BudgetOp<void> => asks(repo =>
        repo.patchBudgetList(user, version, name, v))
}

export default new BudgetServiceInterpreter()
