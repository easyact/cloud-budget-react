import * as TE from 'fp-ts/TaskEither'
import {flow, pipe} from 'fp-ts/function'
import log from '../../../log'
import {BudgetRepositoryV2} from '../BudgetRepositoryV2'
import {getItem, setItem} from 'fp-ts-local-storage'

const getKey = (user: string, version: string) => `${user}.${version}`

export class BudgetRepositoryLocalStorageV2 implements BudgetRepositoryV2 {
    getBudget = flow(
        getKey,
        getItem,
        TE.fromIO,
        TE.chain(TE.fromOption(() => '不存在预算')),
        TE.map(JSON.parse)
    )

    setBudget = (user: string, version: string, v: any) => pipe(
        JSON.stringify(v),
        log('BudgetRepositoryLocalStorage.setBudget'),
        x => setItem(getKey(user, version), x),
        TE.fromIO,
    )
}
