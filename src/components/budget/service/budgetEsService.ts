import {Budget} from '../Model'
import {BudgetSnapshot, Event, Snapshot} from '../../es/lib/es'
import * as E from 'fp-ts/lib/Either'
import {Either} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'
import {Error, EventStore, MemEventStore} from '../../es/lib/eventStore'

type Command = { type: 'IMPORT_BUDGET', payload: any, user: { email: string }, to: { version: string } }

export class BudgetEsService {
    private cache = new Map()
    private eventStore: EventStore = new MemEventStore()
    private snapshot: Snapshot<Budget> = new BudgetSnapshot()

    constructor(user: string) {
        console.log('BudgetEsService init with user', user)
    }

    getBudget(email: string, version: string): Budget {
        return pipe(
            this.eventStore.events(email, version),
            E.chain(this.snapshot.snapshot),
            E.map(map => map.get(version) ?? {}),
            E.getOrElse(() => ({}))
        )
    }

    exec(command: Command): Either<Error, Map<string, Budget>> {
        const {user: {email}, to: {version}} = command
        return pipe(
            BudgetEsService.handleCommand(command),
            E.bindTo('e'),
            E.bind('_', ({e}) => this.eventStore.put(email, version, e)),
            E.bind('es', () => this.eventStore.events(email, version)),
            E.chain(({es}) => this.snapshot.snapshot(es, this.cache))
        )
    }

    private static handleCommand(command: Command): Either<Error, Event<Budget>> {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                return E.right({...command, at: new Date()})
            default:
                return E.left('不支持的命令')
        }
    }
}
