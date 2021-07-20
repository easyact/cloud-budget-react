import {Developing} from '../Developing'

export function Pay() {
    return <div>
        <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li><a href="/">首页</a></li>
                <li className="is-active"><a href="." aria-current="page">支付</a></li>
            </ul>
        </nav>
        <Developing/>
    </div>
}
