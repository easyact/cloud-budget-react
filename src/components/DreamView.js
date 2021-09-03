import {useState} from 'react'
import {FaAngleDown} from 'react-icons/all'
import {useTranslation} from 'react-i18next'

export function DreamView() {
    let {t} = useTranslation()
    const [dreams, setDreams] = useState({
        Be: [{
            name: '财务自由', cashFlow: 15340,
            incomes: [{version: 'target', incomeId: '', assetId: ''}]
        }]
    })
    const dreamTypes = ['Own', 'Be', 'Do']
    const table = type => <table className="table is-striped is-fullwidth">
        <thead>
        <tr>
            <th><input type="checkbox"/></th>
            <th>梦想(目标)</th>
            <th>需要现金流</th>
            <th>关联收入目标</th>
        </tr>
        </thead>
        <tbody>{dreams[type]?.map(({name, cashFlow, incomes = []}) => <tr>
            <th><input type="checkbox"/></th>
            <td>{name}</td>
            <td>{cashFlow}</td>
            <td>{incomes.map(({version, incomeId, assetId}) => <div>{version}-{incomeId}-{assetId}</div>)}</td>
        </tr>)}</tbody>
    </table>
    return dreamTypes.map(n => <section>
        <header className="is-light">{t(`wantTo${n}`)}<FaAngleDown/></header>
        {table(n)}</section>)
}
