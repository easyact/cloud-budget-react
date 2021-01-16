import Kpi from "./budget/Kpi";
import List from "./budget/List";

function Liability() {
    return (<List title="负债" hint="不断从你口袋掏钱出来" columns={[
        {title: '条目', type: 'text'}, {title: '总数', type: 'number'}, {title: '已还', type: 'number'}]}/>);
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
                        <List/>
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
