import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {MemEventStore} from '../components/es/lib/eventStore'
import {getAllEvents, importBudget, sync} from '../components/budget/service/budgetEsService'
import * as E from 'fp-ts/lib/Either'
import {eachLike, like} from '@pact-foundation/pact/src/dsl/matchers'
import log from '../components/log'

const provider = new Pact({
    consumer: 'BudgetWebsite',
    provider: 'BudgetApiGateway',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'warn',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
})

describe(`功能: 作为用户, 为了注册后保留数据`, () => {

    beforeAll(() => provider.setup())
    afterEach(() => provider.verify())
    afterAll(() => provider.finalize())
    const item = {name: 'food', amount: 10}

    const eventStore = new MemEventStore()
    const at = '2021-05-14T00:00:00.012+08'
    const user = 'damoco@easyact.cn'
    const CMD = {
        type: 'IMPORT_BUDGET',
        user: {id: user},
        to: {version: '0'},
        payload: {assets: [{id: '', ...item}]},
    }
    describe(`场景: 注册`, () => {
        describe(`假设服务端没有damoco用户\n并且damoco在本地已有试用数据`, () => {
            it(`当damoco注册\n那么从新客户端访问可以拿到所有历史事件`, async () => {
                await provider.addInteraction({
                    state: 'no user',
                    uponReceiving: 'first upload',
                    withRequest: {
                        method: 'POST',
                        path: '/v0/users/damoco@easyact.cn/events',
                        body: eachLike(CMD),
                        // body: {events: eachLike(CMD)},
                        headers: {'Content-Type': 'application/json', 'origin': like('http://localhost:3000')},
                        // headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: {}
                    },
                })
                await provider.addInteraction({
                    state: 'no user',
                    uponReceiving: 'new client get',
                    withRequest: {
                        method: 'GET',
                        path: '/v0/users/damoco@easyact.cn/events',
                        // headers: {Accept: 'application/json'},
                        headers: {'Origin': like('https://easyact.cn')},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: []
                    },
                })
                await importBudget(user, {assets: [item]})(eventStore)()
                const url = provider.mockService.baseUrl
                const {events, resp} = await sync(url, user)(eventStore)()
                    .then(E.fold(log('sync error'), log('sync success')))
                expect(events).not.toHaveLength(0)
                expect(resp.ok).toStrictEqual(true)
                await provider.removeInteractions()
                await provider.addInteraction({
                    state: 'damoco imported',
                    uponReceiving: 'client get',
                    withRequest: {
                        method: 'GET',
                        path: '/v0/users/damoco@easyact.cn/events',
                        // headers: {Accept: 'application/json'},
                        headers: {'Origin': like('https://easyact.cn')},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: [{...CMD, at: like(at), 'user.id': user}]
                    },
                })
                const baseUrl = provider.mockService.baseUrl
                const events1 = await getAllEvents(baseUrl, user)()
                    .then(E.fold(log('client get error'), log('client get success')))
                // const [{at, ...expected}] = await getEvents('damoco', eventStore)
                expect(events1).toEqual([{...CMD, at, 'user.id': user}])
            }, 20000)
        })
    })
    // describe(`场景: 登录`, () => {
    //     describe(`假设服务端damoco用户已经有事件\n并且damoco在本地有未上传的命令`, () => {
    //         beforeEach(() => provider.addInteraction({
    //             state: 'damoco has events',
    //             uponReceiving: 'upload',
    //             withRequest: {
    //                 method: 'POST',
    //                 path: '/v0/users/damoco@easyact.cn/events',
    //                 headers: {'Content-Type': 'application/json', 'origin': like('http://localhost:3000')},
    //                 body: {events: eachLike(CMD), lastEventId: like(at)},
    //                 // headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    //             },
    //             willRespondWith: {
    //                 status: 200,
    //                 headers: {'access-control-allow-origin': '*'},
    //                 body: []
    //             },
    //         }))
    //         beforeEach(importBudget(user, {assets: [item]})(eventStore))
    //         describe(`当damoco注册`, () => {
    //             beforeEach(async () => {
    //                 const url = provider.mockService.baseUrl
    //                 const {events, resp} = await sync(url, user)(eventStore)()
    //                     .then(E.getOrElse(undefined))
    //                 expect(events).not.toHaveLength(0)
    //                 expect(resp.ok).toStrictEqual(true)
    //             })
    //             it(`那么从新客户端访问可以拿到所有历史事件`, async () => {
    //                 await provider.addInteraction({
    //                     state: 'damoco imported',
    //                     uponReceiving: 'new client get',
    //                     withRequest: {
    //                         method: 'GET',
    //                         path: '/v0/users/damoco@easyact.cn/events',
    //                         // headers: {Accept: 'application/json'},
    //                         headers: {'Origin': like('https://easyact.cn')},
    //                     },
    //                     willRespondWith: {
    //                         status: 200,
    //                         headers: {'access-control-allow-origin': '*'},
    //                         body: [{...CMD, at: like(at), 'user.id': user}]
    //                     },
    //                 })
    //                 const baseUrl = provider.mockService.baseUrl
    //                 const events = await getAllEvents(baseUrl, user)()
    //                 // const [{at, ...expected}] = await getEvents('damoco', eventStore)
    //                 expect(events).toEqual([{...CMD, at, 'user.id': user}])
    //             })
    //         })
    //     })
    // })
})
