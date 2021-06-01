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
    type: CommandType, payload: any, user: { id: string }, to: {
        list?: string
        version: string
    }
}

export class BudgetEsService {
    readonly eventStore: EventStore
    private readonly uid: string

    constructor(uid: string, eventStore: EventStore = new DBEventStore()) {
        this.uid = uid
        this.eventStore = eventStore
        console.log('BudgetEsService init with uid', uid)
    }

    getBudget(version: string): Promise<Budget> {
        console.log('getting Budget')
        return TE.getOrElse(() => T.of({}))(getBudgetE(this.uid, version)(this.eventStore))()
    }

    importBudget = (uid: string, payload: Budget, version: string = '0'): Promise<Budget> =>
        importBudget(uid, payload, version)(this.eventStore)()

    exec = (command: Command): Promise<Budget> => exec(this.uid, command)(this.eventStore)()

}

export const importBudget = (uid: string, payload: Budget, version: string = '0'): ReaderTask<EventStore, Budget> =>
    exec(uid, {
        type: 'IMPORT_BUDGET',
        user: {id: uid},
        to: {version},
        payload
    })

export function exec(uid: string, command: Command): ReaderTask<EventStore, Budget> {
    console.log('executing command', command)
    const {to: {version}} = command
    // return this.cache =
    return pipe(
        handleCommand(command),
        RTE.chain(() => getBudgetE(uid, version)),
        RTE.getOrElse(_ => RT.of({}))
    )
}

export const getBudgetE = (uid: string, version: string): ReaderTaskEither<EventStore, ErrorM, Budget> => pipe(
    // this.cache,
    // E.orElse(_ => pipe(
    getVersions(uid),
    // )),
    RTE.map(versions => versions.get(version) ?? {}),
)

export const getEvents = (uid: string): ReaderTaskEither<EventStore, string, BEvent[]> =>
    pipe(RTE.ask<EventStore>(), RTE.chainTaskEitherK(eventStore => eventStore.events(uid)))

const getVersions = (uid: string): ReaderTaskEither<EventStore, string, Map<string, Budget>> => pipe(
    getEvents(uid),
    RTE.chain(es => RTE.fromEither(budgetSnapshot(es))),
    RTE.map(ss => ss.get(uid) ?? new Map()),
)

function handleCommand(command: Command): ReaderTaskEither<EventStore, ErrorM, void> {
    return pipe(
        RTE.ask<EventStore>(),
        RTE.chainTaskEitherK((s: EventStore) => s.put(command.user.id, fixCommand(command)))
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
    mode: 'cors',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(obj)
})

const filterNewEvents = (uid: string) => (events: BEvent[]) => pipe(
    eventOffset(uid)(),
    O.chain((s: string) => O.tryCatch(() => parseInt(s))),
    O.getOrElse(() => 0),
    offset => O.tryCatch(() => events.slice(offset)),
    O.getOrElse(() => [] as BEvent[])
)

const unUploadedEvents = (uid: string) => pipe(getEvents(uid), RTE.map(filterNewEvents(uid)))

export const uploadEvents = (url: string, uid: string, events: BEvent[]) => TE.tryCatch(
    () => post(`${url}/v0/users/${uid}/events`, events),
    e => `上传事件失败因为: ${e}`
)

export const sync = (uid: string, url: string): ReaderTaskEither<EventStore, string,
    { events: BEvent[], resp: Response }> => pipe(
    // RTE.Do,
    // RTE.apS('events', unUploadedEvents(uid)),
    unUploadedEvents(uid),
    RTE.bindTo('events'),
    RTE.bind('resp', ({events}) => RTE.fromTaskEither(uploadEvents(url, uid, events))),
    RTE.chainFirst(({events}) => setOffsetByEvents(uid, events)),
)

export const migrateEventsToUser = (uid: string, oldUid: string = 'default'): ReaderTaskEither<EventStore, string, any> => pipe(
    RTE.ask<EventStore>(),
    RTE.chain(store => RTE.fromTaskEither(store.modifyUser(oldUid, uid)))
)

export const eventOffset = (uid: string) => getItem(`${uid}.offset`)
export const setEventOffset = (uid: string) => (offset: number): IO<void> => setItem(`${uid}.offset`, String(offset))
const id: Lens<BEvent, BEvent[string]> = Lens.fromProp<BEvent>()('id')
const setOffsetByEvents = (uid: string, events: BEvent[]): ReaderTaskEither<EventStore, string, void> => pipe(
    last(events),
    O.map(id.get),
    O.map(setEventOffset(uid)),
    RTE.fromOption(() => 'setOffsetByEvents got null id'),
    RTE.map(f => f()),
)
