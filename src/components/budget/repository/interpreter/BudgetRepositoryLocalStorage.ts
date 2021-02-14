import {BudgetRepository} from '../BudgetRepository'
import {getItem, setItem} from 'fp-ts-local-storage'
import * as T from 'fp-ts/Task'
import {getOptionM} from 'fp-ts/OptionT'
import * as IO from 'fp-ts/IO'
import {pipe} from 'fp-ts/function'

const MIO = getOptionM(IO.Monad)

// const MT = getOptionM(T.task)

function getKey(user: string, version: string) {
    return `${user}.${version}`
}

export class BudgetRepositoryLocalStorage implements BudgetRepository {
    getBudget = (user: string, version: string) => pipe(
        MIO.map(getItem(getKey(user, version)), JSON.parse),
        T.fromIO,
    )

    setBudget = (user: string, version: string, v: any) => pipe(
        setItem(getKey(user, version), JSON.stringify(v)),
        T.fromIO,
    )
    patchBudgetList = (user: string, version: string, name: string, v: any) => pipe(
        this.getBudget(user, version),
        T.map(({[name]: t, ...rest}: any) => ({...rest, [name]: v})),
        T.chain(json => this.setBudget(user, version, json)),
    )

    // liabilities(user: string, version: string): Promise<any[]> {
    //     return Promise.resolve([]);
    // }
    //
    // query(user: string, version: string): Promise<Budget | null> {
    //     return Promise.resolve(null);
    // }

}

export default new BudgetRepositoryLocalStorage()
