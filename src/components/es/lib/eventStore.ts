import {Command, Event} from './es'
import {Budget} from '../../budget/Model'
import * as E from 'fp-ts/TaskEither'
import {TaskEither} from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import Dexie from 'dexie'
import {fromNullable} from 'fp-ts/lib/Either'

export type Error = string
type BEvent<T> = Event<T> & Command<T>

export interface EventStore {
    put(id: string, event: BEvent<Budget>): TaskEither<Error, any>

    events(id: string): TaskEither<Error, BEvent<Budget>[]>
}

export class MemEventStore implements EventStore {
    private store = new Map()

    put(id: string, event: BEvent<Budget>): TaskEither<Error, any> {
        return pipe(
            this.events(id),
            E.map(es => [...es, event]),
            E.map(es => this.store.set(id, es)),
        )
    }

    events = (id: string): TaskEither<Error, BEvent<Budget>[]> =>
        E.fromEither(fromNullable('none')(this.store.get(id) ?? []))
}

class MyAppDatabase extends Dexie {
    events: Dexie.Table<BEvent<Budget>, number>

    constructor() {
        super('easyact-budget')
        this.version(1).stores({
            events: '++id, user.email, at, version',
            //...other tables goes here...
        })
        // The following line is needed if your typescript
        // is compiled using babel instead of tsc:
        this.events = this.table('events')
    }
}

export class DBEventStore implements EventStore {
    private db: MyAppDatabase = new MyAppDatabase()

    events = (id: string): TaskEither<Error, BEvent<Budget>[]> =>
        E.fromTask(() => this.db.events.where('user.email').equals(id).toArray())

    put(id: string, event: BEvent<Budget>): TaskEither<Error, any> {
        return E.fromTask(() => this.db.events.put(event))
    }
}
