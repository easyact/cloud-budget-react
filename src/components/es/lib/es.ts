import * as E from 'fp-ts/Either'
import {reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as F from 'fp-ts-contrib/lib/Free'
import * as T from 'fp-ts/lib/Task'

export type AggregateId = String

export interface Event<A> extends Readonly<Record<string, any>> {
    at: Date
}

export interface Aggregate {
    id: AggregateId
}

export abstract class Snapshot<A> {
    abstract updateState(e: Event<A>, initial: Map<String, A>): Map<String, A>

    snapshot(es: Event<A>[]): E.Either<String, Map<String, A>> {
        return pipe(es,
            reduce(new Map<String, A>(), (a, e) => this.updateState(e, a)),
            E.right
        )
    }
}

export type Command<A> = F.Free<Event<A>, A>

export interface Commands<A> {
}

export const URI = 'Event'
export type URI = typeof URI
declare module 'fp-ts/HKT' {
    interface URItoKind<A> {
        Event: Event<A>
    }
}

export abstract class RepositoryBackedInterpreter<A> {
    abstract step<A>(e: Event<A>): T.Task<A>

    apply(action: F.Free<URI, A>): T.Task<any> {
        return F.foldFree(T.task)(this.step, action)
    }
}

