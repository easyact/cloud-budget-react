import * as T from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import {flow, pipe} from 'fp-ts/function'
import {log} from '../../../log'
import {BudgetRepositoryV2} from '../BudgetRepositoryV2'
import {getItem, setItem} from 'fp-ts-local-storage'

const getKey = (user: string, version: string) => `${user}.${version}`

export class BudgetRepositoryLocalStorageV2 implements BudgetRepositoryV2 {
    getBudget = flow(
        getKey,
        getItem,
        T.fromIO,
        T.map(O.fold(() => ({}), JSON.parse)),
    )

    setBudget = (user: string, version: string, v: any) => pipe(
        JSON.stringify(v),
        log('BudgetRepositoryLocalStorage.setBudget'),
        x => setItem(getKey(user, version), x),
        T.fromIO,
    )
}
