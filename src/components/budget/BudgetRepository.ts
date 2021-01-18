import {Budget} from "./Model";

export interface BudgetRepository {
    query(user: string, version: string): Promise<Budget | null>

    assets(user: string, version: string): Promise<any[]>

    liabilities(user: string, version: string): Promise<any[]>
}
