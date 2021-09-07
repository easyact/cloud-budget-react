import {useState} from 'react'
import {dateRange, semigroupDailyData} from '../util/Viz'
import * as R from 'ramda'
import {reduce} from 'fp-ts/Array'
import {add, isAfter, isBefore, parseISO} from 'date-fns'
import subMonths from 'date-fns/subMonths'
import {
    area,
    axisRight,
    axisTop,
    scaleLinear,
    scaleOrdinal,
    scaleTime,
    select,
    stack,
    stackOffsetDiverging,
    stackOffsetNone
} from 'd3'
import 'd3-transition'
import {legendColor} from 'd3-svg-legend'
import {format} from 'date-fns/fp'

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
    const dates = dateRange(subMonths(today, 3))//.map(date => ({date, ...randomData(keys)}))
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
        .map(([name, start]) => [name, parseISO(start)])
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
                R.filter(i => !isAfter(parseISO(i.start), date) && !isBefore(parseISO(i.end), date)),
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
    // console.log('data', data)
    return {data, keys, max}
}

const fontSize = 10

// function myX(height, yScale, amount, index, x) {
//     const middle = height / 2
//     const margin = Math.abs(yScale(amount ?? 0)) - middle
//     const offset = margin < fontSize ? index % 2 * -250 + 100 : index % 2 * -100
//     return x + offset + 10
// }

const preventFirst = func => event => {
    // event.preventDefault()
    func(event)
}

function CursorLine({width, height, stackLayout, data, yScale}) {
    const [x, setX] = useState(100)
    const [y, setY] = useState(100)
    const setCoord = (e) => {
        const ctm = e.target.getScreenCTM()
        // console.log(ctm.f)
        setX((e.clientX - ctm.e) / ctm.a)
        setY((e.clientY - ctm.f) / ctm.d)
    }

    const [highLight, setHighLight] = useState()
    // const index = scaleLinear().domain([0, data.length]).range([0, width]).invert(x)
    const index = x / (width / data.length)
    const {date, ...datum} = data[Math.floor(index)]
    const layout = stackLayout([datum])

    function setHighLightAndXY(i, e) {
        setHighLight(i)
        setCoord(e)
    }

// console.log('x', x, index, datum, layout)
    const points = layout.map(({'0': d, key, index: i}) => <circle
        key={`point${key}`} cx={x} cy={yScale(d[1] || d[0])}
        r={highLight === i ? 4 : 3}
        onMouseOver={preventFirst((e) => setHighLightAndXY(i, e))}
        onMouseMove={preventFirst((e) => setHighLightAndXY(i, e))}
        onTouchStart={preventFirst(() => setHighLight(i))}
        onTouchMove={preventFirst(() => setHighLight(i))}
        onTouchEnd={preventFirst(() => setHighLight(i))}
        onTouchCancel={preventFirst(() => setHighLight(i))}
        onMouseDown={preventFirst(() => setHighLight(highLight ? null : i))}
        fill={highLight === i ? 'white' : 'light-green'}
        stroke={highLight === i ? 'black' : 'white'}
    />)
    const texts = layout.map(({'0': d, key, index: i}) => {
        // console.log(d, name, i, layout)
        const amount = d.data[key]
        const offset = i % 2 * -100
        const textX = 10 + x + (highLight === i ? -150 : offset)
        return <text key={`text${i}`} x={textX} y={yScale(d[1] || d[0])}
                     fontSize={`${highLight === i ? fontSize << 2 : fontSize}px`}
                     fill={highLight === i ? '#ffffff' : 'black'}
                     stroke={highLight === i ? 'black' : null}
        >
            {key}:{amount?.toFixed(2)}
        </text>
    })
    return <g id="cursorLine" width={width} height={height}>
        {texts}
        <rect x={0} y={0} width={width} height={height} opacity={0}
            // onTouchMove={preventFirst(event => setCoord(event.touches[0]))}
            // onTouchStart={preventFirst(event => setCoord(event.touches[0]))}
              onMouseMove={preventFirst(event => setCoord(event))}
              onMouseOver={preventFirst(event => setCoord(event))}
        />
        <line x1={x} y1={0} x2={x} y2={height} style={{stroke: 'black'}} strokeDasharray="5, 5"/>
        <line x1={0} y1={y} x2={width} y2={y} style={{stroke: 'black'}} strokeDasharray="5, 5"/>
        <text x={50} y={y + 15}>{yScale.invert(y).toFixed(0)}</text>
        {points}
    </g>
}

export function StreamViz(
    {
        budget,
        width = window.innerWidth,
        height = 500,
        overlaying,
    }) {
    const {data, keys, max} = toStackData(budget)
    const stackLayout = stack().keys(keys).offset(overlaying ? stackOffsetNone : stackOffsetDiverging)
    const xScale = scaleTime().domain([data[0].date, R.last(data)?.date]).range([0, width])
    const yScale = scaleLinear().domain([-max, max]).range([height, 0])
    const stackArea = area()
        .x(d => xScale(d.data.date))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1] || 0))
    // .curve(curveBasis)
    // const colorScale = scaleLinear()
    //     .range(['#06D1B2', '#ffffff'])

    const fillScale = scaleOrdinal()
        .domain(keys)
        .range(['#fcd88a', '#cf7c1c', '#93c464', '#75734F', '#5eafc6', '#41a368'])
    const stacks = stackLayout(data)
        // .map(log('stackLayout'))
        .map((d, i) => <path id={d.key} key={`stack${i}`} d={stackArea(d)} style={{
            fill: fillScale(d.key), stroke: 'black', strokeOpacity: 0.25, opacity: .5
        }}/>)
    const xAxis = axisTop().scale(xScale).tickFormat(format('yy/M'))
    const yAxis = axisRight().scale(yScale)
    const LEGEND_WIDTH = width / keys.length
    const legendA = legendColor().scale(fillScale).orient('horizontal').shapeWidth(LEGEND_WIDTH)
        // .labelAlign("start")
        .labels(({i, generatedLabels,}) => generatedLabels[i].split('').join(' '))
        .labelWrap(LEGEND_WIDTH)
    const callRef = f => node => node && select(node).call(f)
    return <svg width={width} height={height} style={{overflowX: 'auto'}}>
        <g>{stacks}</g>
        <g id="legend" ref={callRef(legendA)} transform="translate(0, 0)"/>
        <g id="xAxisG" ref={callRef(xAxis)} transform={`translate(0,${height})`}/>
        <g id="yAxisG" ref={callRef(yAxis)}/>
        <CursorLine width={width} height={height} data={data} stackLayout={stackLayout} yScale={yScale}/>
    </svg>
}
