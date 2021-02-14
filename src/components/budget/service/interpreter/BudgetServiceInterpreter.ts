import {BudgetOp, BudgetService} from '../BudgetService'
import {asks} from 'fp-ts/Reader'
import {BudgetRepository} from '../../repository/BudgetRepository'
import * as T from 'fp-ts/Task'
import {Task} from 'fp-ts/Task'
import {Option} from 'fp-ts/Option'
import {pipe} from 'fp-ts/function'
import * as R from 'ramda'
import {getOptionM} from 'fp-ts/es6/OptionT'

enum ItemTypes {
    assets,
    liabilities,
    incomes,
    expenses,
}

export type ItemType = keyof typeof ItemTypes

export const MT = getOptionM(T.task)

export class BudgetServiceInterpreter implements BudgetService {
    getAsset = (user: string, version: string) => this.getList(user, version, 'assets')
    setAsset = (user: string, version: string, v: any) => this.setList(user, version, 'assets', v)

    getList = (user: string, version: string, name: ItemType): BudgetOp<Option<any>> => asks(repo => pipe(
        repo.getBudget(user, version),
        to => MT.map(to,
            pipe(
                R.tap<any>(x => console.log('BudgetServiceInterpreter.getList', x)),
                R.prop<any>(name), R.defaultTo<any>([])
            )
        )
    ))

    setList = (user: string, version: string, name: ItemType, v: any = []): BudgetOp<void> => asks<BudgetRepository, Task<void>>(repo => repo.patchBudgetList(user, version, name, v))
}

export default new BudgetServiceInterpreter()
