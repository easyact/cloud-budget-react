import {ReaderEither} from "fp-ts/ReaderEither";
import {ReaderTaskEither} from "fp-ts/ReaderTaskEither";

type BudgetOp = ReaderTaskEither<any, any, any>
export interface BudgetService {
    useAsset(user: string, version: string): BudgetOp
}
