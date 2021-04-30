import {Budget, budgetAdditionMonoid} from '../Model'
import {BudgetSnapshot, Snapshot} from '../../es/lib/es'
import * as E from 'fp-ts/lib/Either'
import {Either} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'
import {Error, EventStore, MemEventStore} from '../../es/lib/eventStore'

type Command = { type: 'IMPORT_BUDGET', payload: any, user: { email: string }, to: { version: string } }

export class BudgetEsService {
    // private cache: Either<string, Map<string, Budget>> = E.left('None')
    private eventStore: EventStore = new MemEventStore()
    private snapshot: Snapshot<Budget> = new BudgetSnapshot()
    private email: string

    constructor(email: string) {
        this.email = email
        console.log('BudgetEsService init with email', email)
    }

    getBudget(version: string): Budget {
        return E.getOrElse(() => ({}))(this.getBudgetE(version))
    }

    private getBudgetE(version: string): Either<Error, Budget> {
        return pipe(
            // this.cache,
            // E.orElse(_ => pipe(
            this.getVersions(),
            // )),
            E.map(map => map.get(version) ?? {}),
        )
    }

    private getVersions(): Either<string, Map<string, Budget>> {
        return pipe(
            this.eventStore.events(this.email),
            E.chain(this.snapshot.snapshot),
            E.map(snapshot => snapshot.get(this.email) ?? new Map()),
        )
    }

    exec(command: Command): Budget {
        const {user: {email}} = command
        // return this.cache =
        return pipe(
            this.handleCommand(command),
            E.bindTo('b'),
            E.bind('_', () => this.eventStore.put(email, {...command, at: new Date()})),
            // E.bind('cache', () => this.cache),
            // E.map(({cache, b}) => cache.set(version, b)),
            E.map(({b}) => b),
            E.getOrElse(_ => ({}))
        )
    }

    private handleCommand(command: Command): Either<Error, Budget> {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                const {to: {version}} = command
                return pipe(
                    this.getBudgetE(version),
                    E.map(b => budgetAdditionMonoid.concat(b, command.payload)),
                )
            default:
                return E.left('不支持的命令')
        }
    }
}
