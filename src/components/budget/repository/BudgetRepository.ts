import {Task} from 'fp-ts/Task'
import {Option} from 'fp-ts/Option'

export interface BudgetRepository {
    getList(user: string, version: string, name: string): Task<Option<any>>

    setList(user: string, version: string, name: string, v: any): Task<void>

    getAssets(user: string, version: string): Task<Option<any>>

    setAssets(user: string, version: string, v: any): Task<void>

    // liabilities(user: string, version: string): Task<[]>
}
