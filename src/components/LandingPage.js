import {Link} from 'react-router-dom'

export function LandingPage() {
    // useScript('https://jinshuju.net/f/KdziDP/embedded.js?inner_redirect=false&banner=show&background=white&height=1326')
    return <div>
        <section className="hero is-light is-bold">
            <div className="hero-body">
                <div className="container is-max-desktop">
                    <h1 className="title">
                        从996到财务自由
                    </h1>
                    <h2 className="subtitle">
                        利用预算的力量, 提升理财效率.
                    </h2>
                    <p>预算无需记账, 只需每月比对估算与实际的偏差, 调整计划.</p>
                    <p>选择适合的投资, 开始行动.</p>
                    <Link to="/budget" className="button is-large is-primary">免费试用</Link>
                </div>
            </div>
        </section>
        <section className="section columns">
            <article className="content column is-3">
                <p className="title">理财难?</p>
                <p className="subtitle">极简预算管理</p>
                <p className="">怎样分配每月的收入才算合理? 利用预算工具仔细管理重要事项的投入比例. </p>
            </article>
            <article className="column is-8">
                <img/>
            </article>
        </section>
        <section className="section container is-max-desktop">
            <div className="columns">
                <article className="content column">
                    <p className="title">没时间创业?</p>
                    <p className="subtitle">996加班到头秃</p>
                    <p>在线众包(建设中)</p>
                </article>
                <article className="content column">
                    <p className="title">没钱创业?</p>
                    <p className="subtitle">投资人那么多为什么就不投我?</p>
                    <p>微服务/API计费平台(建设中)</p>
                    <p>创业孵化资源列表(建设中)</p>
                    <p>在线众筹(建设中)</p>
                </article>
            </div>
        </section>
    </div>
}
