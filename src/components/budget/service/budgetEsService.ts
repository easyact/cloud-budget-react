import {Budget} from '../Model'
import {BudgetSnapshot, Snapshot} from '../../es/lib/es'
import * as E from 'fp-ts/lib/Either'
import {Either} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'
import {Error, EventStore, MemEventStore} from '../../es/lib/eventStore'

type Command = { type: 'IMPORT_BUDGET', payload: any, email: string, version: string }

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
            BudgetEsService.handleCommand(command),
            E.bindTo('_'),
            E.bind('__', () => this.eventStore.put({...command, at: new Date()})),
            E.bind('es', () => this.eventStore.events(email, version)),
            E.chain(({es}) => this.snapshot.snapshot(es, this.cache))
        )
    }

    private static handleCommand(command: Command): Either<Error, void> {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                return E.left('not implement')
            default:
                return E.left('not implement')
        }
    }
}
