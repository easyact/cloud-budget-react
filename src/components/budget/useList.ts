import {useEffect, useRef, useState} from 'react'
import service, {ItemType} from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import {flow} from 'fp-ts/function'

export function useList(user: string, version: string, name: ItemType = 'assets') {
    const [list, setList] = useState([] as any[])
    const save = useRef(false)
    const repo = useRepo()
    useEffect(() => {
        console.log('useList.getting list', user, version, name)
        const taskEither = service.getList(user, version, name)(repo)
        const task = TE.fold(e => T.of(console.error('useList.getting error', e)),
            flow(O.fold(() => console.warn('useList.got none of', name), setList), T.of))(taskEither)
        task().then(x => console.log('useList finish', x))
    }, [repo, name, user, version])

    useEffect(() => {
        console.log('useList.setting list', save.current, user, version, name, list)
        if (save.current) {
            save.current = false
            service.setList(user, version, name, list)(repo)()
        }
    }, [repo, user, version, name, list])

    function saveList(l: any[]) {
        save.current = true
        setList(l)
    }

    return [list, saveList]
}
