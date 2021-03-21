import * as T from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import {getOptionM} from 'fp-ts/OptionT'
import * as IO from 'fp-ts/IO'
import {pipe} from 'fp-ts/function'
import {log} from '../../../log'
import {BudgetRepositoryV2} from '../BudgetRepositoryV2'
import {setItem} from 'fp-ts-local-storage'

const MIO = getOptionM(IO.Monad)

// const MT = getOptionM(T.task)

const getKey = (user: string, version: string) => `${user}.${version}`

export class BudgetRepositoryLocalStorageV2 implements BudgetRepositoryV2 {
    getBudget = (user: string, version: string) => pipe(
        getKey(user, version),
        window.localStorage.getItem,
        O.fromNullable,
        O.getOrElse(() => '{}'),
        JSON.parse,
        T.of)

    setBudget = (user: string, version: string, v: any) => pipe(
        JSON.stringify(v),
        log('BudgetRepositoryLocalStorage.setBudget'),
        x => setItem(getKey(user, version), x),
        T.rightIO,
    )
    patchBudgetList = (user: string, version: string, name: string, v: any) => pipe(
        this.getBudget(user, version),
        T.map(O.getOrElse(() => ({}))),
        T.map(log('patchBudgetList.getBudget')),
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
