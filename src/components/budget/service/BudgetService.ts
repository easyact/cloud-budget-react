import {BudgetRepository} from "../repository/BudgetRepository";
import {ReaderTask} from "fp-ts/ReaderTask";
import {Option} from "fp-ts/Option";

export type BudgetOp<A> = ReaderTask<BudgetRepository, A>

export interface BudgetService {
    useAsset(user: string, version: string): BudgetOp<Option<any>>

    // useLiability(user: string, version: string): BudgetOp<[]>
}
