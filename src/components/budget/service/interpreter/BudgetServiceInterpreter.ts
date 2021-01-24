import {BudgetService} from "../BudgetService";
import {asks} from "fp-ts/Reader";
import {BudgetRepository} from "../../repository/BudgetRepository";
import {Task} from "fp-ts/Task";
import {Option} from "fp-ts/Option";
import {pipe} from "fp-ts/function";

export class BudgetServiceInterpreter implements BudgetService {
    getAsset = (user: string, version: string) =>
        asks<BudgetRepository, Task<Option<any>>>(pipe(
            repo => repo.getAssets(user, version),
            // map(JSON.parse)
        ));
    setAsset = (user: string, version: string, v: any) =>
        asks<BudgetRepository, Task<void>>(repo => repo.setAssets(user, version, v))

    // useLiability = (user: string, version: string): BudgetOp<[]> => undefined;

}

export default new BudgetServiceInterpreter()
