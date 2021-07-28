import * as E from 'fp-ts/Either'
import {Either} from 'fp-ts/Either'
import {reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'

export type AggregateId = string

export interface Event extends Readonly<Record<string, any>> {
    at?: string,
    type: string,
    payload: any
}

export interface Aggregate {
    id: AggregateId
}

export type BUDGET_SNAPSHOT<A> = Map<string, Map<string, A>>

export const snapshot = <A>(updateState: (initial: BUDGET_SNAPSHOT<A>, e: Event) => BUDGET_SNAPSHOT<A>, es: Event[], initial: BUDGET_SNAPSHOT<A> = new Map(),): Either<string, BUDGET_SNAPSHOT<A>> => pipe(
    es,
    reduce(initial, updateState),
    E.right
)
