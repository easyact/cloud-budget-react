import {Link} from 'react-router-dom'

export function LandingPage() {
    // useScript('https://jinshuju.net/f/KdziDP/embedded.js?inner_redirect=false&banner=show&background=white&height=1326')
    return <section className="hero is-light is-bold">
        <div className="hero-body">
            <div className="container">
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
}
