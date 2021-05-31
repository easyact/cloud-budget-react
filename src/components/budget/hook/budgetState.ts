import {Command} from '../service/budgetEsService'
import {Budget} from '../Model'
import {EventStore} from '../../es/lib/eventStore'

export interface BudgetState {
    eventStore: EventStore
    version: string
    budget: Budget
    cmd: Command
    apiUrl: string
}
