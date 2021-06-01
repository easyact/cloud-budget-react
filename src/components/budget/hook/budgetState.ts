import {Command} from '../service/budgetEsService'
import {Budget} from '../Model'
import {EventStore} from '../../es/lib/eventStore'

export interface BudgetState {
    eventStore: EventStore
    uid: string
    version: string
    budget: Budget
    cmd: Command
    apiBase: string
    syncNeeded: true
}
