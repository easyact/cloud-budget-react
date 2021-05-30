import {BudgetEsService, Command} from '../service/budgetEsService'
import {Budget} from '../Model'

export interface BudgetState {
    service: BudgetEsService
    email: string
    version: string
    budget: Budget
    cmd: Command
    apiUrl: string
}
