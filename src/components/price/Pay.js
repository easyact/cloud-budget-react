import {useEffect} from 'react'
import useScript from '../../hooks/useScript'

export function Pay() {
    useScript('//js.hsforms.net/forms/shell.js')
    useEffect(() => {
        window.onload = () =>
            window.hbspt.forms.create({
                region: 'na1',
                portalId: '20302760',
                formId: '70c48266-8015-4fbd-92c5-d627c78784c2'
            })
    }, [])
    return <div>
        <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
                <li><a href="/">首页</a></li>
                <li className="is-active"><a href="." aria-current="page">支付</a></li>
            </ul>
        </nav>
        {/*<Developing/>*/}
    </div>
}
