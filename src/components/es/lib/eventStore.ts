import {Event} from './es'
import {Budget} from '../../budget/Model'
import * as E from 'fp-ts/TaskEither'
import {TaskEither} from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/lib/function'
import Dexie from 'dexie'
import {fromNullable} from 'fp-ts/lib/Either'

export type Error = string

export interface EventStore {
    put(id: string, event: Event<Budget>): TaskEither<Error, void>

    events(id: string): TaskEither<Error, Event<Budget>[]>
}

export class MemEventStore implements EventStore {
    private store = new Map()

    put(id: string, event: Event<Budget>): TaskEither<Error, void> {
        return pipe(
            this.events(id),
            E.map(es => [...es, event]),
            E.map(es => this.store.set(id, es)),
            E.map(_ => undefined),
        )
    }

    events = (id: string): TaskEither<Error, Event<Budget>[]> =>
        E.fromEither(fromNullable('none')(this.store.get(id) ?? []))
}

export class DBEventStore implements EventStore {
    constructor(db: Dexie = new Dexie('easyact-budget')) {
        db.version(1).stores({events: '++id, user.email, at, version'})
    }

    events(id: string): TaskEither<Error, Event<Budget>[]> {
        return E.left('later')
    }

    put(id: string, event: Event<Budget>): TaskEither<Error, void> {
        return E.left('later')
    }
}
