import {BudgetRepository} from '../repository/BudgetRepository'
import {Option} from 'fp-ts/Option'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'

export type BudgetOp<A> = ReaderTaskEither<BudgetRepository, any, A>

export interface BudgetService {
    getAsset(user: string, version: string): BudgetOp<Option<any>>

    setAsset(user: string, version: string, v: any): BudgetOp<void>

    getList(user: string, version: string, name: string): BudgetOp<Option<any>>

    setList(user: string, version: string, name: string, v: any): BudgetOp<void>

    // useLiability(user: string, version: string): BudgetOp<[]>
}
