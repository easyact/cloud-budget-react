import LoginButton from '../../auth/LoginButton'
import {FaCheck} from 'react-icons/all'

export function Price() {
    return <div>
        <div className="hero is-light">
            <div className="hero-body has-text-centered">
                <h1 className="title">小小的投资，大大的回报！</h1>
            </div>
        </div>

        <div className="columns">
            <div className="column is-offset-1 is-4">
                <div className="card">
                    <div className="card-header level">
                        <div className="level-item has-text-centered">
                            <div>
                                <p className="title">免费版</p>
                                <p className="heading">以下皆可享受</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div>
                            <ul>
                                <li className="columns">
                                    <div className="column is-1"><FaCheck/></div>
                                    <div className="column">
                                        基础预算管理
                                        <p>管理资产负债表和收入支出表</p>
                                    </div>
                                </li>
                                <li className="columns">
                                    <div className="column is-1"><FaCheck/></div>
                                    <div className="column">
                                        离线可用
                                        <p>数据存入本地浏览器</p>
                                    </div>
                                </li>
                                <li className="columns">
                                    <div className="column is-1"><FaCheck/></div>
                                    <div className="column">
                                        同步至云端
                                        <p>登录后即可试用60天</p>
                                    </div>
                                </li>
                            </ul>
                            <LoginButton fullWidth={true}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="column is-6">
                <div className="card">
                    <div className="card-header level">
                        <div className="level-item has-text-centered">
                            <div>
                                <p className="title">PRO版</p>
                                <p className="heading">每月15元</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <ul>
                            <li className="columns">
                                <div className="column is-1"><FaCheck/></div>
                                <div className="column">免费版所有功能
                                    <p>预算管理/离线可用等</p>
                                </div>
                            </li>
                            <li className="columns">
                                <div className="column is-1"><FaCheck/></div>
                                <div className="column">随时随地自动同步至云端
                                    <p>可以在PC/Pad/手机之间无缝切换</p>
                                </div>
                            </li>
                            <li className="columns">
                                <div className="column is-1"><FaCheck/></div>
                                <div className="column">优先支持
                                    <p>您的需求将会优先得到处理</p>
                                </div>
                            </li>
                        </ul>
                        {/*<Link to="/pay" className="button is-fullwidth is-primary">马上购买</Link>*/}
                        <a href="https://jinshuju.net/f/KdziDP" className="button is-fullwidth is-primary">马上购买</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
