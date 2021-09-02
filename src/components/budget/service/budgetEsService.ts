import {Budget} from '../Model'
import * as TE from 'fp-ts/lib/TaskEither'
import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as T from 'fp-ts/lib/Task'
import * as O from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/function'
import {BEvent, DBEventStore, ErrorM, EventStore, UnUploadedCommands} from '../../es/lib/eventStore'
import * as R from 'ramda'
import {v4 as uuid} from 'uuid'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import {budgetSnapshot} from './snapshot'
import * as RT from 'fp-ts/ReaderTask'
import {ReaderTask} from 'fp-ts/ReaderTask'
import {TaskEither} from 'fp-ts/TaskEither'
import {Lens} from 'monocle-ts'
import log from '../../log'
import {BUDGET_SNAPSHOT} from '../../es/lib/es'

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

    exec = (command: Command): Promise<Budget> => pipe(
        exec(this.uid, command),
        RTE.map(a => a.budget),
        RTE.getOrElse(_ => RT.of({}))
    )(this.eventStore)()

}

export const importBudget = (uid: string, payload: Budget, version: string = 'current'): ReaderTask<EventStore, Budget> =>
    pipe(
        exec(uid, {
            type: 'IMPORT_BUDGET',
            user: {id: uid},
            to: {version},
            payload
        }),
        RTE.map(a => a.budget),
        RTE.getOrElse(_ => RT.of({}))
    )

export function exec(uid: string, command: Command): ReaderTaskEither<EventStore, ErrorM, AllPhases> {
    console.log('executing command', command)
    const {to: {version}} = command
    // return this.cache =
    return pipe(
        handleCommand(command),
        RTE.chain(() => getBudget(uid, version)),
    )
}

export const getBudgetE = (uid: string, version: string): ReaderTaskEither<EventStore, ErrorM, Budget> => pipe(
    // this.cache,
    // E.orElse(_ => pipe(
    getVersions(uid),
    // )),
    RTE.map(versions => log(`getBudgetE ${uid} ${version}`)(versions.get(version))),
    RTE.chain(budget => budget ? RTE.right(budget) : RTE.left('none')),
)
const fromOption = RTE.fromOption(R.always('none'))

const getValueFromMap = <T>(versions: Map<string, T>, version: string) => pipe(
    versions.get(version),
    O.fromNullable,
    fromOption)

type AllPhases = {
    budget: Budget, events: BEvent[], versions: Map<string, Budget>, userVersions: BUDGET_SNAPSHOT<Budget>
}
export const getBudgetFromEvents = (events: BEvent[], uid: string, version: string): ReaderTaskEither<EventStore, ErrorM, AllPhases> => pipe(
    RTE.of(events),
    RTE.bindTo('events'),
    RTE.bind('userVersions', ({events}) => RTE.fromEither(budgetSnapshot(events))),
    RTE.bind('versions', ({userVersions}) => getValueFromMap(userVersions, uid)),
    RTE.bind('budget', ({versions}) => getValueFromMap(versions, version)),
)
export const getBudget = (uid: string, version: string): ReaderTaskEither<EventStore, ErrorM, AllPhases> => pipe(
    getEvents(uid),
    RTE.chain(events => getBudgetFromEvents(events, uid, version)),
)

// export const getBudgetOrImportExampleIfNone = (uid: string, version: string): ReaderTaskEither<EventStore, ErrorM, Budget> => pipe(
//     getBudgetE(uid, version),
//     RTE.orElse(e => ('none' === e) ? RTE.rightReaderTask(importBudget(uid, EXAMPLE)) : RTE.left(e)),
//     // RTE.chain(() => getBudgetE(uid, version)),
// )

export const getEvents = (uid: string): ReaderTaskEither<EventStore, string, BEvent[]> =>
    pipe(RTE.ask<EventStore>(), RTE.chainTaskEitherK(eventStore => eventStore.events(uid)))

export const unUploadedCommands = (uid: string): ReaderTaskEither<EventStore, any, UnUploadedCommands> =>
    pipe(RTE.ask<EventStore>(), RTE.chainTaskEitherK(eventStore => eventStore.unUploadedCommands(uid)))

const getVersions = (uid: string): ReaderTaskEither<EventStore, string, Map<string, Budget>> => pipe(
    getEvents(uid),
    // RTE.map(log('getVersions')),
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
            const lens = R.lensProp<string, any>('id')
            const item = R.over(lens, R.defaultTo(uuid()))(payload)
            return {...command, payload: item}
        default:
            return command
    }
}

export const getAllEvents = (baseUrl: string, uid: string): TaskEither<Response, BEvent[]> => pipe(
    TE.rightTask(() => fetch(`${baseUrl}/v0/users/${uid}/events`)),
    TE.chain(r => r.ok ? TE.rightTask(() => r.json()) : TE.left(r)),
)

export const post = (url: string, obj: any) => fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(obj)
})

export const uploadEvents = (url: string, uid: string, events: UnUploadedCommands): TaskEither<string, BEvent[]> => pipe(
    TE.tryCatch(() => post(`${url}/v0/users/${uid}/events`, events),
        e => `上传事件失败因为: ${e}`),
    TE.chain(resp => resp.ok ? TE.rightTask(() => resp.json()) :
        TE.left(`${resp.status}: ${resp.statusText}: ${resp.body}`)),
)
type SyncResult = { commands: UnUploadedCommands; events: BEvent[] }

const id = Lens.fromProp<BEvent>()('id')
const updateEvents = (uid: string) => (r: SyncResult): ReaderTaskEither<EventStore, string, any> => pipe(
    RTE.ask<EventStore>(),
    RTE.chainFirst(store => RTE.fromTaskEither(store.deleteList(uid, r.commands))),
    RTE.chainFirst(store => RTE.fromTaskEither(store.putList(uid, r.events.map(id.set(undefined))))),
)

export const sync = (baseUrl: string, uid: string): ReaderTaskEither<EventStore, string, SyncResult> => pipe(
    unUploadedCommands(uid), RTE.bindTo('commands'),
    RTE.bind('events', ({commands}) => RTE.fromTaskEither(uploadEvents(baseUrl, uid, commands))),
    RTE.chainFirst(updateEvents(uid)),
)

export const migrateEventsToUser = (uid: string, oldUid: string = 'default'): ReaderTaskEither<EventStore, string, any> => pipe(
    RTE.ask<EventStore>(),
    RTE.chain(store => RTE.fromTaskEither(store.modifyUser(oldUid, uid)))
)

// const M = getMonoid<BEvent>()
// const eventId: Lens<BEvent, BEvent[string]> = Lens.fromProp<BEvent>()('id')
