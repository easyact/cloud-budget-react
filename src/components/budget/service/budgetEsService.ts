import {Budget, budgetAdditionMonoid} from '../Model'
import {BUDGET_SNAPSHOT, Event, snapshot} from '../../es/lib/es'
import * as TE from 'fp-ts/lib/TaskEither'
import {TaskEither} from 'fp-ts/lib/TaskEither'
import * as RE from 'fp-ts/lib/ReaderTaskEither'
import * as T from 'fp-ts/lib/Task'
import {pipe} from 'fp-ts/lib/function'
import {DBEventStore, Error, EventStore} from '../../es/lib/eventStore'
import * as R from 'ramda'
import {v4 as uuid} from 'uuid'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import {Either} from 'fp-ts/Either'

type CommandType = 'IMPORT_BUDGET' | 'PUT_ITEM' | 'DELETE_ITEM'
export type Command = {
    type: CommandType, payload: any, user: { email: string }, to: {
        list?: string
        version: string
    }
}

export class BudgetEsService {
    // private cache: TaskEither<string, Map<string, Budget>> = E.left('None')
    private readonly eventStore: EventStore
    private readonly email: string

    constructor(email: string, eventStore: EventStore = new DBEventStore()) {
        this.email = email
        this.eventStore = eventStore
        console.log('BudgetEsService init with email', email)
    }

    getBudget(version: string): Promise<Budget> {
        console.log('getting Budget')
        return TE.getOrElse(() => T.of({}))(this.getBudgetE(version))()
    }

    private getBudgetE(version: string): TaskEither<Error, Budget> {
        return pipe(
            // this.cache,
            // E.orElse(_ => pipe(
            this.getVersions(),
            // )),
            TE.map(versions => versions.get(version) ?? {}),
        )
    }

    private getVersions(): TaskEither<string, Map<string, Budget>> {
        return pipe(
            this.eventStore.events(this.email),
            TE.chain(es => TE.fromEither(budgetSnapshot(es))),
            TE.map(ss => ss.get(this.email) ?? new Map()),
        )
    }

    importBudget = (email: string, payload: Budget, version: string = '0'): Promise<Budget> => this.exec({
        type: 'IMPORT_BUDGET',
        user: {email},
        to: {version},
        payload: payload
    })

    exec(command: Command): Promise<Budget> {
        console.log('executing command', command)
        const {to: {version}} = command
        // return this.cache =
        return pipe(
            handleCommand(command)(this.eventStore),
            TE.chain(() => this.getBudgetE(version)),
            TE.getOrElse(_ => T.of({}))
        )()
    }

}

const budgetSnapshot = (es: Event<Budget>[]): Either<string, BUDGET_SNAPSHOT<Budget>> => snapshot(updateState, es)

function handleCommand(command: Command): ReaderTaskEither<EventStore, Error, void> {
    const {type, payload, user: {email}} = command
    switch (type) {
        case 'IMPORT_BUDGET':
            const idFilled = R.mapObjIndexed(R.map(({id = uuid(), ...vs}) => ({id, ...vs})))(payload)
            return pipe(
                RE.ask<EventStore>(),
                RE.chainTaskEitherK(
                    (s: EventStore) => s.put(email, {...command, payload: idFilled, at: new Date()})
                ))
        case 'PUT_ITEM':
            const lens = R.lensProp('id')
            const item = R.over(lens, R.defaultTo(uuid()))(payload)
            return pipe(
                RE.ask<EventStore>(),
                RE.chainTaskEitherK((s: EventStore) => s.put(email, {...command, payload: item, at: new Date()})
                ))
        case 'DELETE_ITEM':
            return pipe(
                RE.ask<EventStore>(),
                RE.chainTaskEitherK((s: EventStore) => s.put(email, {...command, at: new Date()})
                ))
        default:
            return RE.left('不支持的命令')
    }
}


function updateState(initial: BUDGET_SNAPSHOT<Budget>, e: Event<Budget>): BUDGET_SNAPSHOT<Budget> {
    const {user: {email}, to: {version}} = e
    const versions = initial.get(email) ?? new Map<string, Budget>()
    const budget = versions.get(version) ?? {}
    const updatedBudget = updateBudget(e, budget)
    return initial.set(email, versions.set(version, updatedBudget))
}

function updateBudget(e: Event<Budget>, budget: Budget): Budget {
    switch (e.type) {
        case 'IMPORT_BUDGET':
            return importBudget(budget, e.payload)
        case 'PUT_ITEM':
            const {payload} = e
            return importBudget(budget, {[payload.type]: [payload]})
        case 'DELETE_ITEM':
            const {payload: {from, id: deletingId}} = e
            return R.over(R.lensProp(from), R.filter(({id}) => id !== deletingId))(budget)
        default:
            return budget
    }
}

const importBudget = (budget: Budget, importing: Budget) => budgetAdditionMonoid.concat(budget, importing)
