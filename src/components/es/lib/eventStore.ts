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

export abstract class EventStore {
    put = (id: string, event: BEvent): TaskEither<ErrorM, any> => this.putList(id, [event])

    abstract events(id: string): TaskEither<ErrorM, BEvent[]>

    abstract modifyUser(oldUid: string, uid: string): TaskEither<ErrorM, any>

    abstract clear(uid: string): TaskEither<ErrorM, any>

    abstract putList(uid: string, events: BEvent[]): TaskEither<ErrorM, any>
}

const id = Lens.fromPath<BEvent>()(['user', 'id'])

export class MemEventStore extends EventStore {
    private store = new Map()

    put = (id: string, event: BEvent) => this.putList(id, [event])

    events = (id: string): TaskEither<never, BEvent[]> => TE.right(this.store.get(id) ?? [])

    modifyUser = (oldUid: string, uid: string): TaskEither<ErrorM, any> => pipe(
        this.events(oldUid),
        TE.map(map(id.set(uid))),
        TE.chainFirst(es => TE.of(this.store.set(uid, es))),
        TE.chainFirst(() => TE.of(this.store.delete(oldUid)))
    )

    clear = (uid: string): TaskEither<ErrorM, any> => TE.right(this.store.delete(uid))

    putList(uid: string, events: BEvent[]): TaskEither<ErrorM, any> {
        return pipe(
            this.events(uid),
            TE.map(es => [...es, ...events]),
            TE.map(es => this.store.set(id, es)),
        );
    }

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

export class DBEventStore extends EventStore {
    private db: MyAppDatabase = new MyAppDatabase()
    private table = this.db.events
    private findByUid = (id: string) => this.table.where('user.id').equals(id)

    events = (id: string): TaskEither<ErrorM, BEvent[]> => {
        return TE.fromTask(() => this.findByUid(id).toArray())
    }

    put = (id: string, event: BEvent): TaskEither<ErrorM, any> => TE.fromTask(() => this.table.put(event))

    modifyUser = (oldUid: string, uid: string): TaskEither<ErrorM, any> => TE.fromTask(() =>
        this.findByUid(oldUid).modify(id.set(uid)))

    clear = (uid: string): TaskEither<ErrorM, any> => TE.fromTask(() => this.findByUid(uid).delete())

    putList(uid: string, events: BEvent[]): TaskEither<ErrorM, any> {
        return TE.fromTask(() => this.table.bulkPut(events));
    }
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
