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

    constructor(user: string) {
        console.log('BudgetEsService init with user', user)
    }

    getBudget(email: string, version: string): Budget {
        return E.getOrElse(() => ({}))(this.getBudgetE(email, version))
    }

    private getBudgetE(email: string, version: string): Either<Error, Budget> {
        return pipe(
            // this.cache,
            // E.orElse(_ => pipe(
            this.getVersions(email),
            // )),
            E.map(map => map.get(version) ?? {}),
        )
    }

    private getVersions(email: string): Either<string, Map<string, Budget>> {
        return pipe(
            this.eventStore.events(email),
            E.chain(this.snapshot.snapshot),
            E.map(snapshot => snapshot.get(email) ?? new Map()),
        )
    }

    exec(command: Command): Either<Error, Map<string, Budget>> {
        const {user: {email}} = command
        // return this.cache =
        return pipe(
            this.handleCommand(command),
            E.bindTo('b'),
            E.bind('_', () => this.eventStore.put(email, {...command, at: new Date()})),
            // E.bind('cache', () => this.cache),
            // E.map(({cache, b}) => cache.set(version, b)),
            E.chain(_ => this.getVersions(email)),
        )
    }

    private handleCommand(command: Command): Either<Error, Budget> {
        switch (command.type) {
            case 'IMPORT_BUDGET':
                const {user: {email}, to: {version}} = command
                return pipe(
                    this.getBudgetE(email, version),
                    E.map(b => budgetAdditionMonoid.concat(b, command.payload)),
                )
            default:
                return E.left('不支持的命令')
        }
    }
}
