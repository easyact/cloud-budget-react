import {useState} from 'react'
import {area, stack} from 'd3-shape'
import {dateRange} from '../util/Viz'
import {scaleLinear, scaleThreshold} from 'd3-scale'

function Switch({state: [hiding, setHiding]}) {
    return <button onClick={() => setHiding(!hiding)} className="button">{hiding ? '展开' : '收起'}</button>
}

function toStackData(budget) {
    const data = dateRange().map(date => ({date, test: Math.random() * 10, t2: Math.random() * 10}))
    return [data, ['test', 't2']]
}

export function StreamViz({budget, width = 1000, height = 300}) {
    const [data, keys] = toStackData(budget)
    const stackLayout = stack().keys(keys)
    const xScale = scaleLinear().domain([0, 30]).range([0, width])
    const yScale = scaleLinear().domain([0, 60]).range([height, 0])
    const stackArea = area()
        .x((d, i) => xScale(i))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
    // .curve(curveBasis)

    const colorScale = scaleThreshold().domain([1, 5])
        .range(['#75739F', '#5EAFC6', 'green', 'blue', 'red'])
    const stacks = stackLayout(data).map((d, i) =>
        <path key={`stack${i}`} d={stackArea(d)} style={{
            fill: colorScale(Math.random() * 5), stroke: 'black', strokeOpacity: 0.25
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
