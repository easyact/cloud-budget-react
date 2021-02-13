import {BudgetRepository} from '../repository/BudgetRepository'
import {ReaderTask} from 'fp-ts/ReaderTask'
import {Option} from 'fp-ts/Option'

export type BudgetOp<A> = ReaderTask<BudgetRepository, A>

export interface BudgetService {
    getAsset(user: string, version: string): BudgetOp<Option<any>>

    setAsset(user: string, version: string, v: any): BudgetOp<void>

    getList(user: string, version: string, name: string): BudgetOp<Option<any>>

    setList(user: string, version: string, name: string, v: any): BudgetOp<void>

    // useLiability(user: string, version: string): BudgetOp<[]>
}
