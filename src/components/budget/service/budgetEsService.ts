import {Budget} from '../Model'
import {Event} from '../../es/lib/es'

type Command = { type: 'IMPORT_BUDGET', payload: any }

export interface EventStore {
    put(event: Event<Budget>): void
}

export class BudgetEsService {
    constructor(user: string) {
        console.log('BudgetEsService init with user', user)
    }

    private cache = new Map()
    private eventStore: EventStore

    getBudget(version: string): Budget {
        return this.cache.get(version)
    }

    import(version: string, payload: Budget) {
        this.cache.set(version, payload)
    }

    exec(command: Command) {
        this.handleCommand(command)
        this.eventStore.put({...command, at: new Date()})
    }

    private handleCommand(command: Command) {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                return
            default:
                return
        }
    }
}
