import {useState} from 'react'
import {area, stack} from 'd3-shape'
import {dateRange, semigroupDailyData} from '../util/Viz'
import {scaleLinear} from 'd3-scale'
import * as R from 'ramda'
import {reduce} from 'fp-ts/Array'
import {isBefore} from 'date-fns'
import subMonths from 'date-fns/subMonths'

function Switch({state: [hiding, setHiding]}) {
    return <button onClick={() => setHiding(!hiding)} className="button">{hiding ? '展开' : '收起'}</button>
}

function toStackKeys(items) {
    const pluck = R.pluck('name')
    return [...pluck(items || [])]
}

function toStackData(budget = {}) {
    const amountLens = R.lensProp('amount')
    // const typeLens = R.lensProp('type')
    const expenses = R.map(R.pipe(
        R.over(amountLens, R.negate),
        // R.set(typeLens, 'expense')
    ))(budget.expenses || [])
    const items = [...expenses, .../*R.map(R.set(typeLens, 'income'))*/(budget.incomes || [])]
    // console.log(items)
    const keys = toStackKeys(items)
    // const randomData = R.pipe(R.map(k => [k, Math.random() * 10]), R.fromPairs)
    const dates = dateRange(subMonths(new Date(), 6))//.map(date => ({date, ...randomData(keys)}))
    // console.log('dailyData', dailyData, items)
    const getMax = R.pipe(
        R.values,
        R.groupBy(x => x > 0),
        R.values,
        R.map(R.pipe(R.sum, Math.abs)),
        R.apply(Math.max))
    const {arr: data, max} = reduce({arr: [], last: {}, max: 0}, ({arr, last, max}, date) => {
        const filter = items.filter(i => isBefore((i.start), (date)))
        const dailyData = R.pipe(
            R.map(R.props(['name', 'amount'])), R.fromPairs
        )(filter)
        const cur = semigroupDailyData.concat(last, dailyData)
        const newMax = R.pipe(getMax, R.max(max))(cur)
        return {arr: [...arr, {...cur, date}], last: cur, max: newMax}
    })(dates)
    // console.log('data', data)
    return {data, keys, max}
}

export function StreamViz({budget, width = window.innerWidth, height = 300}) {
    const {data, keys, max} = toStackData(budget)
    const stackLayout = stack().keys(keys)
    const xScale = scaleLinear().domain([0, 400]).range([0, width])
    const yScale = scaleLinear().domain([0, max * 2]).range([height, 0])
    const stackArea = area()
        .x((d, i) => xScale(i))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1] || 0))
    // .curve(curveBasis)

    const colorScale = scaleLinear()
        // .domain([0, 1])
        .range(['#336666', '#ccffcc'])
    const stacks = stackLayout(data).map((d, i) =>
        <path key={`stack${i}`} d={stackArea((d))} style={{
            fill: (colorScale(Math.random())), stroke: 'black', strokeOpacity: 0.25
        }}/>)

    const state = useState()
    if (state[0])
        return <Switch state={state}/>
    return <section>
        <Switch state={state}/>
        <svg width="100%" height={300}>
            <g transform={'translate(0,' + (-height / 2) + ')'}>
                {stacks}
            </g>
        </svg>
    </section>
}
