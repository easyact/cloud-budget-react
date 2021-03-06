import {Option} from 'fp-ts/Option'
import {TaskEither} from 'fp-ts/TaskEither'

type BudgetTE<A> = TaskEither<any, A>

export interface BudgetRepository {
    getBudget(user: string, version: string): BudgetTE<Option<any>>

    setBudget(user: string, version: string, v: any): BudgetTE<void>

    patchBudgetList(user: string, version: string, name: string, v: any): BudgetTE<void>
}
