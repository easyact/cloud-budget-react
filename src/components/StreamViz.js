import {useState} from 'react'
import {area, stack} from 'd3-shape'
import {dateRange, semigroupDailyData} from '../util/Viz'
import {scaleLinear, scaleTime} from 'd3-scale'
import * as R from 'ramda'
import {reduce} from 'fp-ts/Array'
import {add, isAfter, isBefore} from 'date-fns'
import subMonths from 'date-fns/subMonths'
import {axisRight, axisTop} from 'd3-axis'
import {select} from 'd3-selection'
import {formatISOWithOptions} from 'date-fns/esm/fp'

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
    const items = [.../*R.map(R.set(typeLens, 'income'))*/(budget.incomes || []), ...expenses,]
    // console.log(items)
    const keys = toStackKeys(items)
    // const randomData = R.pipe(R.map(k => [k, Math.random() * 10]), R.fromPairs)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates = dateRange(subMonths(today, 6))//.map(date => ({date, ...randomData(keys)}))
    // console.log('dailyData', dailyData, items)
    const getMax = R.pipe(
        R.values,
        R.groupBy(x => x > 0),
        R.values,
        R.map(R.pipe(R.sum, Math.abs)),
        R.apply(Math.max))
    const day0 = dates[0]
    const durations = R.pipe(R.map(R.props(['name', 'duration'])), R.fromPairs)(items)
    const firstOccurredDates = items.map(R.props(['name', 'start']))
        .map(([name, start]) => [name, new Date(start.setHours(0, 0, 0, 0))])
        .map(([name, start]) => {
            // console.log('[name, start]', [name, start], day0)
            const duration = durations[name]
            // console.log('isBefore', isBefore(start, day0), start, day0)
            while (isBefore(start, day0)) {
                start = add(start, duration)
            }
            return [name, start]
        })
    const {arr: data, max} = reduce({arr: [], last: {}, next: firstOccurredDates, max: 0},
        ({arr, last, next: occurredDates, max}, date) => {
            // const filter = items.filter(i => isBefore(i.start, date))
            const occurredThisDayPairs = occurredDates.filter(([_, start]) => start.getTime() === date.getTime())
            // console.log('filter', occurredThisDayPairs)
            const occurredThisDay = R.pluck(0, occurredThisDayPairs)
            // console.log('occurredThisDay', occurredThisDay,)
            const dailyData = R.pipe(
                R.filter(i => !isAfter(i.start, date)),
                // R.filter(i => i.amount > 0),
                R.map(R.props(['name', 'amount'])),
                R.fromPairs,
                R.pick(occurredThisDay),// log('pick' + occurredThisDay),
            )(items)
            // console.log('dailyData', dailyData)
            const cur = semigroupDailyData.concat(last, dailyData)
            const newMax = R.pipe(getMax, R.max(max))(cur)
            const next = occurredDates.map(R.when(
                ([name]) => occurredThisDay.includes(name),
                ([name, date]) => {
                    const duration = durations[name]
                    // console.log('duration', duration)
                    return [name, add(date, duration)]
                }
            ))
            // console.log('next', next, occurredDates)
            return {arr: [...arr, {...cur, date}], last: cur, max: newMax, next}
        })(dates)
    console.log('data', data)
    return {data, keys, max}
}

function CursorLine({width, height, stackLayout, data}) {
    const [x, setX] = useState(100)
    // const index = scaleLinear().domain([0, data.length]).range([0, width]).invert(x)
    const index = x / (width / data.length)
    const {date, ...datum} = data[Math.floor(index)]
    const layout = stackLayout([datum])[0]
    console.log('x', x, index, datum, layout)
    const points = Object.entries(datum).map((name, amount) => <g>
        <circle cx={x} cy={100} r={2}/>
        <text x={x} y={100}>{name}:{amount}</text>
    </g>)
    return <g id="cursorLine" width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} onMouseMove={event => setX(event.clientX)} opacity={0}/>
        <line x1={x} y1={0} x2={x} y2={height} style={{stroke: 'black'}}/>
        {points}
    </g>
}

export function StreamViz({budget, width = window.innerWidth, height = 300}) {
    const state = useState()
    if (state[0])
        return <Switch state={state}/>
    const {data, keys, max} = toStackData(budget)
    const stackLayout = stack().keys(keys)
    const xScale = scaleTime().domain([data[0].date, data[data.length - 1].date]).range([0, width])
    const yScale = scaleLinear().domain([-max, max]).range([height, 0])
    const stackArea = area()
        .x(d => xScale(d.data.date))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1] || 0))
    // .curve(curveBasis)

    const colorScale = scaleLinear()
        // .domain([0, 1])
        .range(['#06D1B2', '#ffffff'])
    const stacks = stackLayout(data)
        // .map(log('stackLayout'))
        .map((d, i) => <path id={d.key} key={`stack${i}`} d={stackArea(d)} style={{
            fill: (colorScale(Math.random())), stroke: 'black', strokeOpacity: 0.25
        }}/>)
    const xAxis = axisTop().scale(xScale)
        .tickFormat(formatISOWithOptions({representation: 'date'}))
    const yAxis = axisRight().scale(yScale)
    const axisRef = axis => node => node && select(node).call(axis)
    return <section>
        <Switch state={state}/>
        <svg width={width} height={height}>
            <g>{stacks}</g>
            <g id="xAxisG" ref={axisRef(xAxis)} transform={`translate(0,${height})`}/>
            <g id="yAxisG" ref={axisRef(yAxis)}/>
            <CursorLine width={width} height={height} data={data} stackLayout={stackLayout}/>
            {/*<g id="cursorLine" ref={cursorLineRef}/>*/}
        </svg>
    </section>
}
