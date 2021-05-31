import {Budget} from '../Model'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as RT from 'fp-ts/lib/ReaderTask'
import * as T from 'fp-ts/lib/Task'
import * as O from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/function'
import {BEvent, DBEventStore, ErrorM, EventStore} from '../../es/lib/eventStore'
import * as R from 'ramda'
import {v4 as uuid} from 'uuid'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import {budgetSnapshot} from './snapshot'
import {ReaderTask} from 'fp-ts/ReaderTask'
import {getItem, setItem} from 'fp-ts-local-storage'
import {last} from 'fp-ts/lib/Array'
import {Lens} from 'monocle-ts'
import {IO} from 'fp-ts/lib/IO'

type CommandType = 'IMPORT_BUDGET' | 'PUT_ITEM' | 'DELETE_ITEM'
export type Command = {
    id?: number,
    type: CommandType, payload: any, user: { email: string }, to: {
        list?: string
        version: string
    }
}

export class BudgetEsService {
    // private cache: TaskEither<string, Map<string, Budget>> = E.left('None')
    readonly eventStore: EventStore
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

export function exec(email: string, command: Command): ReaderTask<EventStore, Budget> {
    console.log('executing command', command)
    const {to: {version}} = command
    // return this.cache =
    return pipe(
        handleCommand(command),
        RTE.chain(() => getBudgetE(email, version)),
        RTE.getOrElse(_ => RT.of({}))
    )
}

const getBudgetE = (email: string, version: string): ReaderTaskEither<EventStore, ErrorM, Budget> => pipe(
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

function handleCommand(command: Command): ReaderTaskEither<EventStore, ErrorM, void> {
    return pipe(
        RTE.ask<EventStore>(),
        RTE.chainTaskEitherK((s: EventStore) => s.put(command.user.email, fixCommand(command)))
    )
}

function fixCommand(command: Command): BEvent {
    const {type, payload} = command
    switch (type) {
        case 'IMPORT_BUDGET':
            const idFilled = R.mapObjIndexed(R.map(({id = uuid(), ...vs}) => ({id, ...vs})))(payload)
            return {...command, payload: idFilled}
        case 'PUT_ITEM':
            const lens = R.lensProp('id')
            const item = R.over(lens, R.defaultTo(uuid()))(payload)
            return {...command, payload: item}
        case 'DELETE_ITEM':
            return {...command}
        default:
            throw new Error('不支持的命令')
    }
}

export const post = (url: string, obj: any) => fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(obj)
})

export const uploadEvents =
    (email: string, url: string): ReaderTaskEither<EventStore, string, { events: BEvent[], resp: Response }> => pipe(
        getEvents(email),
        RTE.map(events => pipe(
            eventOffset(email)(),
            O.chain((s: string) => O.tryCatch(() => parseInt(s))),
            O.getOrElse(() => 0),
            offset => O.tryCatch(() => events.slice(offset)),
            O.getOrElse(() => [] as BEvent[])
        )),
        RTE.bindTo('events'),
        RTE.bind('resp', ({events}) => RTE.fromTask(() => post(url, events))),
        RTE.chainFirst(({events}) => setOffsetByEvents(email, events)),
    )

export const eventOffset = (email: string) => getItem(`${email}.offset`)
export const setEventOffset = (email: string) => (offset: number): IO<void> => setItem(`${email}.offset`, String(offset))
const id: Lens<BEvent, BEvent[string]> = Lens.fromProp<BEvent>()('id')
const setOffsetByEvents = (email: string, events: BEvent[]): ReaderTaskEither<EventStore, string, void> => pipe(
    last(events),
    O.map(id.get),
    O.map(setEventOffset(email)),
    RTE.fromOption(() => 'setOffsetByEvents got null id'),
    RTE.map(f => f()),
)
