import {Event} from './es'
import {Budget} from '../../budget/Model'
import * as E from 'fp-ts/Either'
import {Either} from 'fp-ts/Either'

export type Error = string

export interface EventStore {
    put(event: Event<Budget>): Either<Error, void>

    events(email: string, version: string): Either<Error, Event<Budget>[]>
}

export class MemEventStore implements EventStore {
    put(event: Event<Budget>): Either<Error, void> {
        return E.left('not implement')
    }

    events(email: string, version: string): Either<Error, Event<Budget>[]> {
        return E.left('not implement')
    }
}
