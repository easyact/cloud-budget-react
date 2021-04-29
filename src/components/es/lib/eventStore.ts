import {Event} from './es'
import {Budget} from '../../budget/Model'
import * as E from 'fp-ts/Either'
import {Either} from 'fp-ts/Either'
import {pipe} from 'fp-ts/lib/function'
import * as R from 'ramda'

export type Error = string

export interface EventStore {
    put(email: string, version: string, event: Event<Budget>): Either<Error, void>

    events(email: string, version: string): Either<Error, Event<Budget>[]>
}

export class MemEventStore implements EventStore {
    private store = new Map()

    put(email: string, version: string, event: Event<Budget>): Either<Error, void> {
        return pipe(
            this.events(email, version),
            E.map(es => es.push(event)),
            E.map(es => this.store.set(version, es)),
            E.map(_ => undefined),
        )
    }

    events(email: string, version: string): Either<Error, Event<Budget>[]> {
        return R.tap(console.log, pipe(
            E.fromNullable('none')(this.store.get(version)),
            E.orElse(() => E.right([] as Event<Budget>[])),
        ))
    }
}
