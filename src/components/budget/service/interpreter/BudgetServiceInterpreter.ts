import {BudgetOp, BudgetService} from '../BudgetService'
import {asks} from 'fp-ts/Reader'
import {BudgetRepository} from '../../repository/BudgetRepository'
import {Task} from 'fp-ts/Task'
import {Option} from 'fp-ts/Option'

export class BudgetServiceInterpreter implements BudgetService {
    getAsset = (user: string, version: string) => asks<BudgetRepository, Task<Option<any>>>(repo => repo.getAssets(user, version))
    setAsset = (user: string, version: string, v: any) => asks<BudgetRepository, Task<void>>(repo => repo.setAssets(user, version, v))

    getList = (user: string, version: string, name: string): BudgetOp<Option<any>> => asks<BudgetRepository, Task<Option<any>>>(repo => repo.getList(user, version, name))

    setList = (user: string, version: string, name: string, v: any): BudgetOp<void> => asks<BudgetRepository, Task<void>>(repo => repo.setList(user, version, name, v))

    // useLiability = (user: string, version: string): BudgetOp<[]> => undefined;

}

export default new BudgetServiceInterpreter()
