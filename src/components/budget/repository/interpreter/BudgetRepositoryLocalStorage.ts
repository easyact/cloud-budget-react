import {BudgetRepository} from '../BudgetRepository'
import {getItem, setItem} from 'fp-ts-local-storage'
import T from 'fp-ts/Task'
import {getOptionM} from 'fp-ts/OptionT'
import * as IO from 'fp-ts/IO'
import {pipe} from 'fp-ts/function'
import * as R from 'ramda'

const MIO = getOptionM(IO.Monad)

// const MT = getOptionM(T.task)

function getKey(user: string, version: string) {
    return `${user}.${version}`
}

export class BudgetRepositoryLocalStorage implements BudgetRepository {
    getAssets = (user: string, version: string) => this.getList(user, version, 'assets')

    setAssets = (user: string, version: string, v: any) => this.setList(user, version, 'assets', v)

    getList = (user: string, version: string, name: string) => pipe(
        MIO.map(getItem(getKey(user, version)), JSON.parse),
        T.fromIO,
        T.map(R.prop<any>(name)))

    setList = (user: string, version: string, name: string, v: any) => pipe(
        this.getList(user, version, name),
        T.map(({[name]: t, ...rest}: any) => ({...rest, [name]: v})),
        JSON.stringify,
        jsonString => setItem(getKey(user, version), jsonString),
        T.fromIO)

    // liabilities(user: string, version: string): Promise<any[]> {
    //     return Promise.resolve([]);
    // }
    //
    // query(user: string, version: string): Promise<Budget | null> {
    //     return Promise.resolve(null);
    // }

}

export default new BudgetRepositoryLocalStorage()
