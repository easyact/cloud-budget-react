import {BudgetRepository} from "../BudgetRepository";
import {getItem, setItem} from 'fp-ts-local-storage'
import {fromIO} from "fp-ts/Task";
import {getOptionM} from "fp-ts/OptionT";
import * as IO from "fp-ts/IO";
import {pipe} from "fp-ts/function";

const optionIO = getOptionM(IO.Monad)

function getKey(user: string, version: string) {
    return `${user}.${version}`;
}

export class BudgetRepositoryLocalStorage implements BudgetRepository {
    assets = (user: string, version: string) => pipe(
        optionIO.map(getItem(getKey(user, version)), s => JSON.parse(s)),
        fromIO)

    setAssets = (user: string, version: string, v: any) => pipe(
        setItem(getKey(user, version), v),
        fromIO)

    // liabilities(user: string, version: string): Promise<any[]> {
    //     return Promise.resolve([]);
    // }
    //
    // query(user: string, version: string): Promise<Budget | null> {
    //     return Promise.resolve(null);
    // }

}
