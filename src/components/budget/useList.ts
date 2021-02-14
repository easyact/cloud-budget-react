import {useEffect, useState} from 'react'
import service, {ItemType} from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'
import * as O from 'fp-ts/Option'
import * as R from 'ramda'

export function useList(user: string, version: string, name: ItemType = 'assets') {
    const [list, setList] = useState([])
    const repo = useRepo()
    useEffect(() => {
        console.log('useList.getting list', user, version, name)
        const task = service.getList(user, version, name)(repo)
        task()
            .then(R.tap(x => console.log('useList.got list', x)))
            .then(O.map(setList))
    }, [repo, name, user, version])

    useEffect(() => {
        console.log('useList.setting list', user, version, name, list)
        service.setList(user, version, name, list)(repo)()
    }, [repo, user, version, name, list])

    return [list, setList]
}
