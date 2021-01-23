import {Task} from "fp-ts/Task";
import {Option} from "fp-ts/Option";

export interface BudgetRepository {
    // query(user: string, version: string): Task<Budget | null>

    assets(user: string, version: string): Task<Option<any>>

    setAssets(user: string, version: string, v: any): Task<void>

    // liabilities(user: string, version: string): Task<[]>
}
