import {Event} from './es'
import {Budget} from '../../budget/Model'
import * as E from 'fp-ts/Either'
import {Either} from 'fp-ts/Either'
import {identity, pipe} from 'fp-ts/lib/function'
import * as R from 'ramda'

export type Error = string

export interface EventStore {
    put(id: string, event: Event<Budget>): Either<Error, void>

    events(id: string): Either<Error, Event<Budget>[]>
}

export class MemEventStore implements EventStore {
    private store = new Map()

    put(id: string, event: Event<Budget>): Either<Error, void> {
        return pipe(
            this.events(id),
            E.map(es => es.push(event)),
            E.map(es => this.store.set(id, es)),
            E.map(_ => undefined),
        )
    }

    events(id: string): Either<Error, Event<Budget>[]> {
        return R.tap(identity, pipe(
            E.fromNullable('none')(this.store.get(id)),
            E.orElse(() => E.right([] as Event<Budget>[])),
        ))
    }
}
