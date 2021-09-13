import {Link} from 'react-router-dom'
import {FaAngleRight} from 'react-icons/all'

export function LandingPage() {
    // useScript('https://jinshuju.net/f/KdziDP/embedded.js?inner_redirect=false&banner=show&background=white&height=1326')
    return <div>
        <section className="hero is-light is-bold has-text-centered">
            <div className="hero-body">
                <div className="container is-full-desktop">
                    <h1 className="title">
                        从996到财务自由
                        {/*没有出头之日?*/}
                        {/*没有好用的个人财务管理软件?*/}
                    </h1>
                    <h2 className="subtitle">
                        按照富爸爸的理念, 管理个人财务报表.
                        {/*利用预算的力量, 防止财务暴雷.*/}
                        {/*利用EasyAct云预算管理资产负债与收入支出.*/}
                        {/*利用EasyAct云预算管理资产组合与被动收入.*/}
                        {/*利用预算的力量, 开始投资你的未来.*/}
                        {/*利用预算的力量, 提升理财效率.*/}
                    </h2>
                    {/*<p>无需记账, 只需每月比对估算与实际的偏差, 调整计划.</p>*/}
                    {/*<p>选择适合的投资, 开始行动.</p>*/}
                    {/*<p>利用可视化工具模拟未来的分期情况, 提前做好分期计划. </p>*/}
                    <p>管理适合的资产, 年轻退休.</p>
                    <p>可视化未来的现金流, 避免财务暴雷. </p>
                    {/*<p>按照富爸爸的理念, 管理个人财务报表</p>*/}
                    <div className="field is-grouped is-grouped-centered">
                        <p className="control">
                            <Link to="/budget" className="button is-large is-primary">免费试用</Link>
                        </p>
                        <p className="control">
                            <Link to="/doc" className="button is-large is-ghost">了解更多</Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
        <section className="hero is-primary is-light">
            <div className="hero-body">
                <div className="container is-full-desktop">
                    <div className="columns">
                        <article className="content column is-3">
                            <p className="subtitle">记账太繁琐?</p>
                            {/*<p className="subtitle">理财难?</p>*/}
                            <p className="title">极简预算管理</p>
                            <p className="">怎样分配每月的支出才算合理? 利用预算工具仔细管理重要事项的投入比例. </p>
                            <Link to="/budget" className="button is-large  is-primary">探索预算管理<FaAngleRight/></Link>
                        </article>
                        <article className="column is-7 is-offset-1">
                            <img alt="预算管理UI示例"
                                 src="https://s3.cn-northwest-1.amazonaws.com.cn/assets.easyact.cn/example.png"/>
                        </article>
                    </div>
                </div>
            </div>
        </section>
        <div className="container is-max-desktop" hidden={true}>
            <section className="section is-medium">
                <div className="columns">
                    <article className="content column">
                        <p className="title">没时间创业?</p>
                        <p className="subtitle">996加班到头秃</p>
                        <ul>
                            <li>微服务/API计费平台(建设中)</li>
                            <li>在线众包(建设中)</li>
                        </ul>
                    </article>
                    <article className="content column">
                        <p className="title">没钱创业?</p>
                        <p className="subtitle">投资人那么多为什么就不投我?</p>
                        <ul>
                            <li>创业孵化资源列表(建设中)</li>
                            <li>在线众筹(建设中)</li>
                        </ul>
                    </article>
                </div>
            </section>
        </div>
    </div>
}
