import * as E from 'fp-ts/Either'
import {reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as F from 'fp-ts-contrib/lib/Free'
import {Task} from 'fp-ts/lib/Task'

export type AggregateId = String

export interface Event {
    at: Date
}

export interface Aggregate {
    id: AggregateId
}

export abstract class Snapshot<A> {
    abstract updateState(e: Event, initial: Map<String, A>): Map<String, A>

    snapshot(es: Event[]): E.Either<String, Map<String, A>> {
        return pipe(es,
            reduce(new Map<String, A>(), (a, e) => this.updateState(e, a)),
            E.right
        )
    }
}

export type Command<A> = F.Free<Event, A>

export interface Commands<A> {
}

export abstract class RepositoryBackedInterpreter {
    abstract step(e: Event) : Task<any>

    // apply<A>(action: F.Free<Event, A>): Task<A> {
    //         // action.foldMap(step)
    //     return
    // }
}
