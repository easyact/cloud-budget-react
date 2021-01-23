import {BudgetService} from "../BudgetService";
import {asks} from "fp-ts/Reader";
import {BudgetRepository} from "../../repository/BudgetRepository";
import {Task} from "fp-ts/Task";
import {Option} from "fp-ts/Option";

export class BudgetServiceInterpreter implements BudgetService {
    useAsset = (user: string, version: string) =>
        asks<BudgetRepository, Task<Option<any>>>(repo => repo.assets(user, version));

    // useLiability = (user: string, version: string): BudgetOp<[]> => undefined;

}
