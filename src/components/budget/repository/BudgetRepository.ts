import {Task} from 'fp-ts/Task'
import {Option} from 'fp-ts/Option'

export interface BudgetRepository {
    getBudget(user: string, version: string): Task<Option<any>>

    setBudget(user: string, version: string, v: any): Task<void>

    patchBudgetList(user: string, version: string, name: string, v: any): Task<void>
}
