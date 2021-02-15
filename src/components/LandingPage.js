import {useEffect} from 'react'

export function LandingPage() {

    // <script src="https://jinshuju.net/f/KdziDP/embedded.js?inner_redirect=false&banner=show&background=white&height=1326"/>
    useEffect(() => {
        const script = document.createElement('script');

        script.src = "https://jinshuju.net/f/KdziDP/embedded.js?inner_redirect=false&banner=show&background=white&height=1326";
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    return <section className="hero is-light is-bold">
        {/*<div className="hero-body">*/}
        {/*    <div className="container">*/}
        {/*        <h1 className="title">*/}
        {/*            从996到财务自由*/}
        {/*        </h1>*/}
        {/*        <h2 className="subtitle">*/}
        {/*            通过目标明确预算，马上开始行动.*/}
        {/*        </h2>*/}
        {/*        <p>无需繁复的记账, 只需每月比对估算与实际的偏差, 并调整预算即可.</p>*/}
        {/*        <p>设定财务目标, 确定差距, 选择最适合您的财务手段, 开始行动.</p>*/}
        {/*        <Link to="/budget" className="button is-large is-primary">开始预算</Link>*/}
        {/*    </div>*/}
        {/*</div>*/}
    </section>
}
