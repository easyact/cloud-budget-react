import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {MemEventStore} from '../components/es/lib/eventStore'
import {importBudget} from '../components/budget/service/budgetEsService'
import * as E from 'fp-ts/lib/Either'
import {eachLike} from '@pact-foundation/pact/src/dsl/matchers'

const provider = new Pact({
    consumer: 'BudgetWebsite',
    provider: 'BudgetApiGateway',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'warn',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
})

async function getEvents(email, eventStore) {
    const either = await eventStore.events(email)()
    return E.getOrElse(_ => [])(either)
}

describe(`功能: 作为新用户, 为了注册后保留数据`, () => {

    beforeAll(() => provider.setup())
    afterEach(() => provider.verify())
    afterAll(() => provider.finalize())
    const item = {name: 'food', amount: 10}

    describe(`场景: 注册`, () => {
        describe(`假设服务端没有damoco用户\n并且damoco在本地已有试用数据`, () => {
            const eventStore = new MemEventStore()
            const EVENT = {
                type: 'IMPORT_BUDGET',
                at: '2021-05-14T00:00:00.012+08',
                user: {email: 'damoco'},
                to: {version: '0'},
                payload: {assets: [{id: '', ...item}]},
            }
            beforeEach(() => provider.addInteraction({
                state: 'no user',
                uponReceiving: 'first upload',
                withRequest: {
                    method: 'POST',
                    path: '/v0/users/damoco@easyact.cn/events',
                    body: eachLike(EVENT),
                    // headers: {Accept: 'application/json'},
                },
                willRespondWith: {
                    status: 200,
                    headers: {'access-control-allow-origin': '*'},
                    // body: ''
                },
            }))
            beforeEach(importBudget('damoco', {assets: [item]})(eventStore))
            describe(`当damoco注册`, () => {
                beforeEach(async () => {
                    const url = `${provider.mockService.baseUrl}/v0/users/damoco@easyact.cn/events`
                    expect(url).toBeTruthy()
                    const events = await getEvents('damoco', eventStore)
                    expect(events).not.toHaveLength(0)
                    const resp = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify(events)
                    })
                    expect(resp.ok).toStrictEqual(true)
                })
                it(`那么从新客户端访问可以拿到所有历史事件`, async () => {
                    await provider.addInteraction({
                        state: 'damoco imported',
                        uponReceiving: 'new client get',
                        withRequest: {
                            method: 'GET',
                            path: '/v0/users/damoco@easyact.cn/events',
                            // headers: {Accept: 'application/json'},
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {'access-control-allow-origin': '*'},
                            body: [EVENT]
                        },
                    })
                    const events = await fetch(`${provider.mockService.baseUrl}/v0/users/damoco@easyact.cn/events`)
                        .then(r => r.json())
                    // const [{at, ...expected}] = await getEvents('damoco', eventStore)
                    expect(events).toEqual([EVENT])
                })
            })
        })
    })
})
