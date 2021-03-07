import {useEffect, useState} from 'react'
import service from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'

export function useBudget(user: string, version: string) {
    const [budget, setBudget] = useState({})
    const repo = useRepo()

    useEffect(() => {
        console.log('useBudget.setting Budget', user, version, budget)
        service.setBudget(user, version, budget)(repo)()
    }, [repo, user, version, budget])

    return {budget, setBudget}
}
