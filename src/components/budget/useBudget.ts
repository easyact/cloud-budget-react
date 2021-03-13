import {useEffect, useRef, useState} from 'react'
import service from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'

export function useBudget(user: string, version: string) {
    const [budget, setBudget] = useState({})
    const repo = useRepo()
    const save = useRef(false)

    useEffect(() => {
        console.log('useBudget.setting Budget', save.current, user, version, budget)
        if (save.current) {
            save.current = false
            service.setBudget(user, version, budget)(repo)()
        }
    }, [repo, user, version, budget])

    function saveBudget(x: any) {
        save.current = true
        setBudget(x)
    }

    return {budget, saveBudget}
}
