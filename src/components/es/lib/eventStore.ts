import {Event} from './es'
import {Budget} from '../../budget/Model'
import * as TE from 'fp-ts/TaskEither'
import {TaskEither} from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import Dexie from 'dexie'
import {Command} from '../../budget/service/budgetEsService'
import {map} from 'fp-ts/lib/Array'
import {Lens} from 'monocle-ts'

export type ErrorM = string
export type BEvent = Event<Budget> & Command

export interface EventStore {
    put(id: string, event: BEvent): TaskEither<ErrorM, any>

    events(id: string): TaskEither<ErrorM, BEvent[]>

    modifyUser(oldUid: string, uid: string): TaskEither<ErrorM, any>
}

const id = Lens.fromPath<BEvent>()(['user', 'id'])

export class MemEventStore implements EventStore {
    private store = new Map()

    put = (id: string, event: BEvent) => pipe(
        this.events(id),
        TE.map(es => [...es, event]),
        TE.map(es => this.store.set(id, es)),
    )

    events = (id: string): TaskEither<never, BEvent[]> => TE.right(this.store.get(id) ?? [])

    modifyUser = (oldUid: string, uid: string): TaskEither<ErrorM, any> => pipe(
        this.events(oldUid),
        TE.map(map(id.set(uid))),
        TE.chainFirst(es => TE.of(this.store.set(uid, es))),
        TE.chainFirst(() => TE.of(this.store.delete(oldUid)))
    )

}

class MyAppDatabase extends Dexie {
    events: Dexie.Table<BEvent, number>

    constructor() {
        super('easyact-budget')
        this.version(1).stores({
            events: '++id, user.id, at, version',
            //...other tables goes here...
        })
        // The following line is needed if your typescript
        // is compiled using babel instead of tsc:
        this.events = this.table('events')
    }
}

export class DBEventStore implements EventStore {
    private db: MyAppDatabase = new MyAppDatabase()

    private table = this.db.events

    events = (id: string): TaskEither<ErrorM, BEvent[]> =>
        TE.fromTask(() => this.table.where('user.id').equals(id).toArray())

    put = (id: string, event: BEvent): TaskEither<ErrorM, any> => TE.fromTask(() => this.table.put(event))

    modifyUser = (oldUid: string, uid: string): TaskEither<ErrorM, any> => TE.fromTask(() =>
        this.table.where('user.id').equals(oldUid).modify(id.set(uid)))
}

// export class RemoteEventStore implements EventStore {
//     modifyUser(oldUid: string, uid: string): TaskEither<ErrorM, any> {
//         return undefined
//     }
//
//     private uri: string
//
//     constructor(uri: string) {
//         this.uri = uri
//     }
//
//     events = (id: string): TaskEither<ErrorM, BEvent[]> =>
//         TE.fromTask(() => fetch('').then(a => []))
//
//     put(id: string, event: BEvent): TaskEither<ErrorM, any> {
//         return TE.fromTask(() => fetch(''))
//     }
// }
