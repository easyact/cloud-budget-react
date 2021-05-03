import {Budget, budgetAdditionMonoid} from '../Model'
import {BudgetSnapshot, Snapshot} from '../../es/lib/es'
import * as E from 'fp-ts/lib/Either'
import {Either} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/function'
import {Error, EventStore, MemEventStore} from '../../es/lib/eventStore'
import * as R from 'ramda'
import {v4 as uuid} from 'uuid'

type CommandType = 'IMPORT_BUDGET' | 'PUT_ITEM' | 'DELETE_ITEM'
type Command = {
    type: CommandType, payload: any, user: { email: string }, to: {
        list?: string
        version: string
    }
}

export class BudgetEsService {
    // private cache: Either<string, Map<string, Budget>> = E.left('None')
    private eventStore: EventStore
    private snapshot: Snapshot<Budget> = new BudgetSnapshot()
    private readonly email: string

    constructor(email: string, eventStore: EventStore = new MemEventStore()) {
        this.email = email
        this.eventStore = eventStore
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
        const {to: {version}, type, payload} = command
        switch (type) {
            case 'IMPORT_BUDGET':
                return this.importBudget(version, payload)
            case 'PUT_ITEM':
                const {to, item} = payload
                return this.importBudget(version, {[to]: [item]})
            case 'DELETE_ITEM':
                const {from, id: deletingId} = payload
                return pipe(this.getBudgetE(version),
                    E.map(b => R.over(R.lensProp(from), R.filter(({id}) => id !== deletingId))(b)))
            default:
                return E.left('不支持的命令')
        }
    }

    private importBudget = (version: string, importing: Budget) => pipe(
        this.getBudgetE(version),
        E.map(b => {
            console.log('executing concat', b, importing)
            // @ts-ignore
            const idFilled: Budget = R.mapObjIndexed(R.map(({id = uuid(), ...vs}) => ({id, ...vs})))(importing)
            const r = budgetAdditionMonoid.concat(b, idFilled)
            console.log('executed concat', r)
            return r
        }),
    )
}
