import {useEffect, useState} from 'react'
import service from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'
import * as O from 'fp-ts/Option'

export function useList(user: string, version: string) {
    const [list, setList] = useState([])
    const repo = useRepo()
    useEffect(() => {
        const task = service.getList(user, version, 'assets')(repo)
        task().then(O.map(setList))
    }, [repo, user, version])

    useEffect(() => {
        service.setAsset(user, version, list)(repo)()
    }, [user, version, list, repo])

    return [list, setList]
}
