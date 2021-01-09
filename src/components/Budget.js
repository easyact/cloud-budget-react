import Kpi from "./budget/Kpi";
import {Asset} from "./budget/Asset";

function Liability() {
    return null;
}

function Statement() {
    return null;
}

function Budget() {
    return (
        <div>
            <div className="level is-mobile">
                <div className="level-item has-text-centered">
                    <Kpi/>
                </div>
                {/*<div className="level-item has-text-centered">*/}
                {/*    <Progress/>*/}
                {/*</div>*/}
            </div>
            <div className="columns">
                <fieldset className="column">
                    <div className="panel">
                        <Asset/>
                    </div>
                    <div className="panel">
                        <Liability/>
                    </div>
                </fieldset>
                <fieldset className="column">
                    <div className="panel">
                        <Statement/>
                    </div>
                    <div className=" panel">
                        <Statement title=" 支出"/>
                    </div>
                </fieldset>
            </div>
            <div className=" field is-grouped is-grouped-multiline">
                <div className=" field has-addons control">
                    <p className=" control is-expanded">
                        <input id="ver" className="input is-small"/>
                    </p>
                    <p className=" control">
                        <button type=" submit" className=" button is-info is-small">
                            分支
                        </button>
                    </p>
                </div>
                <div className=" control">
                    <button className="button is-small">
                        导出
                    </button>
                </div>
                <div className="control">
                    <button className=" button is-small">
                        导入
                    </button>
                    <input id="file-input" type=" file" name=" name" style={{display: 'none'}}/>
                </div>
            </div>
        </div>
    );
}

export default Budget;
