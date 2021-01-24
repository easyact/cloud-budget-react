import {useEffect, useState} from 'react'
import service from './service/interpreter/BudgetServiceInterpreter'
import {useRepo} from './useRepo'
import * as O from "fp-ts/Option";

export function useAssets(user: string, version: string) {
    const [assets, setAssets] = useState([])
    const repo = useRepo()
    useEffect(() => {
        const task = service.getAsset(user, version)(repo)
        task().then(O.map(setAssets))
    }, [repo, user, version])

    useEffect(() => {
        service.setAsset(user, version, assets)(repo)()
    }, [user, version, assets, repo])

    return [assets, setAssets]
}
