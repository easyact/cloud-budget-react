import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {MemEventStore} from '../components/es/lib/eventStore'
import {importBudget} from '../components/budget/service/budgetEsService'
import * as E from 'fp-ts/lib/Either'
import {eachLike} from '@pact-foundation/pact/src/dsl/matchers'
import assert from 'assert'

const provider = new Pact({
    consumer: 'BudgetWebsite',
    provider: 'BudgetApiGateway',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'warn',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
})

describe(`功能: 作为新用户, 为了注册后保留数据`, () => {

    beforeAll(() => provider.setup())
    afterEach(() => provider.verify())
    afterAll(() => provider.finalize())
    const item = {name: 'food', amount: 10}

    describe(`场景: 注册`, () => {
        describe(`假设服务端没有damoco用户\n并且damoco在本地已有试用数据`, () => {
            const eventStore = new MemEventStore()
            beforeEach(importBudget('damoco', {assets: [item]})(eventStore))
            describe(`当damoco注册`, () => {
                it(`那么简单将本地数据上传到服务器`, async () => {
                    await provider.addInteraction({
                        state: 'no user',
                        uponReceiving: 'first upload',
                        withRequest: {
                            method: 'POST',
                            path: '/v0/users/damoco@easyact.cn/events',
                            body: eachLike({
                                type: 'PUT_ITEM',
                                at: '2021-05-14T00:00:00.012+08',
                                user: {email: 'damoco'},
                                to: {version: '0'},
                                payload: {assets: [{id: '', ...item}]},
                            }),
                            // headers: {Accept: 'application/json'},
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {'access-control-allow-origin': '*'},
                            // body: ''
                        },
                    })
                    const url = provider.mockService.baseUrl + '/v0/users/damoco@easyact.cn/events'
                    expect(url).toBeTruthy()

                    const either = await eventStore.events('damoco')()
                    assert.ok(E.isRight(either))
                    const events = E.getOrElse(_ => [])(either)
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
                // it(`那么简单将本地数据上传到服务器`, pipe(
                //     eventStore.events('damoco'),
                //     TE.fold(T.of, events => async () => {
                //         expect(events).not.toHaveLength(0)
                //         await provider.addInteraction({
                //             state: 'no user',
                //             uponReceiving: 'first upload',
                //             withRequest: {
                //                 method: 'POST',
                //                 path: '/v0/users/damoco@easyact.cn/events',
                //                 body: eachLike({
                //                     id: '09',
                //                     type: 'PUT_ITEM',
                //                     at: '2021-05-14T00:00:00.012+08'
                //                 })
                //             },
                //             willRespondWith: {
                //                 status: 200,
                //             },
                //         })
                //         const url = provider.mockService.baseUrl + '/v0/users/damoco@easyact.cn/events'
                //         expect(url).toBeTruthy()
                //         const resp = await fetch(url, {
                //             method: 'POST',
                //             headers: {
                //                 'content-type': 'application/json'
                //             },
                //             body: JSON.stringify(events)
                //         })
                //         expect(resp).toStrictEqual(undefined)
                //     })
                // ))
            })
        })
    })
})
