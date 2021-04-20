import {BudgetEsService} from '../service/budgetEsService'
import {Budget} from '../Model'

export interface BudgetState {
    service: BudgetEsService
    email: string
    version: string
    budget: Budget
}
