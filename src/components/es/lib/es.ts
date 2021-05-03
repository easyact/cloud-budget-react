import * as E from 'fp-ts/Either'
import {reduce} from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'
import * as F from 'fp-ts-contrib/lib/Free'
import * as T from 'fp-ts/lib/Task'
import {Budget, budgetAdditionMonoid} from '../../budget/Model'
import * as R from 'ramda'

export type AggregateId = string

export interface Event<A> extends Readonly<Record<string, any>> {
    at: Date,
    type: string,
    payload: any
}

export interface Aggregate {
    id: AggregateId
}

export type BUDGET_SNAPSHOT<A> = Map<string, Map<string, A>>

export abstract class Snapshot<A> {
    abstract updateState(e: Event<A>, initial: BUDGET_SNAPSHOT<A>): BUDGET_SNAPSHOT<A>

    snapshot(es: Event<A>[], initial: BUDGET_SNAPSHOT<A> = new Map()): E.Either<string, BUDGET_SNAPSHOT<A>> {
        const self = this
        return pipe(es,
            reduce(initial, (a, e) => self.updateState(e, a)),
            E.right
        )
    }
}

export class BudgetSnapshot extends Snapshot<Budget> {
    updateState(e: Event<Budget>, initial: BUDGET_SNAPSHOT<Budget>): BUDGET_SNAPSHOT<Budget> {
        const {user: {email}, to: {version}} = e
        const versions = initial.get(email) ?? new Map<string, Budget>()
        const budget = versions.get(version) ?? {}
        const updatedBudget = this.updateBudget(e, budget)
        return initial.set(email, versions.set(version, updatedBudget))
    }

    updateBudget(e: Event<Budget>, budget: Budget): Budget {
        const {to: {version}} = e
        switch (e.type) {
            case 'IMPORT_BUDGET':
                return this.importBudget(budget, e.payload)
            case 'PUT_ITEM':
                const {payload: {to, item}} = e
                return this.importBudget(version, {[to]: [item]})
            case 'DELETE_ITEM':
                const {payload: {from, id: deletingId}} = e
                return R.over(R.lensProp(from), R.filter(({id}) => id !== deletingId))(budget)
            default:
                return budget
        }
    }

    private importBudget = (budget: Budget, importing: Budget) => budgetAdditionMonoid.concat(budget, importing)
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

