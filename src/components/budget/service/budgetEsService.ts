import {Budget} from '../Model'
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
            E.map(versions => versions.get(version) ?? {}),
        )
    }

    private getVersions(): Either<string, Map<string, Budget>> {
        return pipe(
            this.eventStore.events(this.email),
            E.chain(es => this.snapshot.snapshot(es)),
            E.map(snapshot => snapshot.get(this.email) ?? new Map()),
        )
    }

    exec(command: Command): Budget {
        const {to: {version}} = command
        // return this.cache =
        return pipe(
            this.handleCommand(command),
            E.chain(() => this.getBudgetE(version)),
            E.getOrElse(_ => ({}))
        )
    }

    private handleCommand(command: Command): Either<Error, void> {
        const {type, payload, user: {email}} = command
        switch (type) {
            case 'IMPORT_BUDGET':
                const idFilled = R.mapObjIndexed(R.map(({id = uuid(), ...vs}) => ({id, ...vs})))(payload)
                return this.eventStore.put(email, {...command, payload: idFilled, at: new Date()})
            case 'PUT_ITEM':
                const lens = R.lensPath(['item', 'id'])
                const item = R.over(lens, R.defaultTo(uuid()))(payload)
                return this.eventStore.put(email, {...command, payload: item, at: new Date()})
            case 'DELETE_ITEM':
                return this.eventStore.put(email, {...command, at: new Date()})
            default:
                return E.left('不支持的命令')
        }
    }
}
