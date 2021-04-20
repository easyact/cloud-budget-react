import {Budget} from '../Model'

export class BudgetEsService {
    constructor(user: string) {
        console.log('BudgetEsService init with user', user)
    }

    private cache = new Map()

    getBudget(version: string): Budget {
        return this.cache.get(version)
    }
}
