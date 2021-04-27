import {Budget} from '../Model'
import {BudgetSnapshot, Event, Snapshot} from '../../es/lib/es'
import * as E from 'fp-ts/lib/Either'
import {Either} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'

type Command = { type: 'IMPORT_BUDGET', payload: any, email: string, version: string }
type Error = string

export interface EventStore {
    put(event: Event<Budget>): Either<Error, void>

    events(email: string, version: string): Either<Error, Event<Budget>[]>
}

class MemEventStore implements EventStore {
    put(event: Event<Budget>): Either<Error, void> {
        return E.left('not implement')
    }

    events(email: string, version: string): Either<Error, Event<Budget>[]> {
        return E.left('not implement')
    }
}

export class BudgetEsService {
    private cache = new Map()
    private eventStore: EventStore = new MemEventStore()
    private snapshot: Snapshot<Budget> = new BudgetSnapshot()

    constructor(user: string) {
        console.log('BudgetEsService init with user', user)
    }

    getBudget(version: string): Budget {
        return this.cache.get(version)
    }

    import(version: string, payload: Budget) {
        this.cache.set(version, payload)
    }

    exec(command: Command): Either<Error, Map<string, Budget>> {
        const {email, version} = command
        return pipe(
            this.handleCommand(command),
            E.bindTo('_'),
            E.bind('__', () => this.eventStore.put({...command, at: new Date()})),
            E.bind('es', () => this.eventStore.events(email, version)),
            E.chain(({es}) => this.snapshot.snapshot(es, this.cache))
        )
    }

    private handleCommand(command: Command): Either<Error, void> {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                return E.left('not implement')
            default:
                return E.left('not implement')
        }
    }
}
