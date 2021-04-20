import * as E from 'fp-ts/Either'
import {reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as F from 'fp-ts-contrib/lib/Free'
import * as T from 'fp-ts/lib/Task'

export type AggregateId = String

export interface Event<A> {
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

export abstract class RepositoryBackedInterpreter<A> {
    abstract step(e: Event<A>): T.Task<any>

    apply(action: F.Free<Event<A>, A>): T.Task<any> {
        return foldMap(action, this.step)
    }
}

function foldMap<A>(action: F.Free<Event<A>, A>, f: (e: Event<A>) => T.Task<any>): T.Task<any> {
    return T.of('test') //TODO
}
