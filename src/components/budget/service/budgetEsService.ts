import {Budget} from '../Model'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as RT from 'fp-ts/lib/ReaderTask'
import * as T from 'fp-ts/lib/Task'
import {pipe} from 'fp-ts/lib/function'
import {BEvent, DBEventStore, Error, EventStore} from '../../es/lib/eventStore'
import * as R from 'ramda'
import {v4 as uuid} from 'uuid'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import {budgetSnapshot} from './snapshot'
import {ReaderTask} from 'fp-ts/ReaderTask'

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
        return TE.getOrElse(() => T.of({}))(getBudgetE(this.email, version)(this.eventStore))()
    }

    importBudget = (email: string, payload: Budget, version: string = '0'): Promise<Budget> =>
        importBudget(email, payload, version)(this.eventStore)()

    exec = (command: Command): Promise<Budget> => exec(this.email, command)(this.eventStore)()

}

export const importBudget = (email: string, payload: Budget, version: string = '0'): ReaderTask<EventStore, Budget> =>
    exec(email, {
        type: 'IMPORT_BUDGET',
        user: {email},
        to: {version},
        payload
    })

function exec(email: string, command: Command): ReaderTask<EventStore, Budget> {
    console.log('executing command', command)
    const {to: {version}} = command
    // return this.cache =
    return pipe(
        handleCommand(command),
        RTE.chain(() => getBudgetE(email, version)),
        RTE.getOrElse(_ => RT.of({}))
    )
}

const getBudgetE = (email: string, version: string): ReaderTaskEither<EventStore, Error, Budget> => pipe(
    // this.cache,
    // E.orElse(_ => pipe(
    getVersions(email),
    // )),
    RTE.map(versions => versions.get(version) ?? {}),
)

export const getEvents = (email: string): ReaderTaskEither<EventStore, string, BEvent[]> =>
    pipe(RTE.ask<EventStore>(), RTE.chainTaskEitherK(eventStore => eventStore.events(email)))

const getVersions = (email: string): ReaderTaskEither<EventStore, string, Map<string, Budget>> => pipe(
    getEvents(email),
    RTE.chain(es => RTE.fromEither(budgetSnapshot(es))),
    RTE.map(ss => ss.get(email) ?? new Map()),
)

function handleCommand(command: Command): ReaderTaskEither<EventStore, Error, void> {
    const {type, payload, user: {email}} = command
    switch (type) {
        case 'IMPORT_BUDGET':
            const idFilled = R.mapObjIndexed(R.map(({id = uuid(), ...vs}) => ({id, ...vs})))(payload)
            return pipe(
                RTE.ask<EventStore>(),
                RTE.chainTaskEitherK(
                    (s: EventStore) => s.put(email, {...command, payload: idFilled, at: new Date()})
                ))
        case 'PUT_ITEM':
            const lens = R.lensProp('id')
            const item = R.over(lens, R.defaultTo(uuid()))(payload)
            return pipe(
                RTE.ask<EventStore>(),
                RTE.chainTaskEitherK((s: EventStore) => s.put(email, {...command, payload: item, at: new Date()})
                ))
        case 'DELETE_ITEM':
            return pipe(
                RTE.ask<EventStore>(),
                RTE.chainTaskEitherK((s: EventStore) => s.put(email, {...command, at: new Date()})
                ))
        default:
            return RTE.left('不支持的命令')
    }
}

export const register = (email: string, url: string): ReaderTaskEither<EventStore, string, { events: BEvent[], resp: Response }> =>
    pipe(
        getEvents(email),
        RTE.bindTo('events'),
        RTE.bind('resp', ({events}) => RTE.fromTask(() => fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(events)
        })))
    )
