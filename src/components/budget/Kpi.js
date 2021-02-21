function Kpi({name = '被动收入/支出', value = 0 / 29598.67}) {
    return (
        <div>
            <p className="heading">{name}</p>
            <p className="title">{value}</p>
        </div>
    )
}

export default Kpi
