import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {MemEventStore} from '../components/es/lib/eventStore'
import {exec, getAllEvents, importBudget, migrateEventsToUser, sync} from '../components/budget/service/budgetEsService'
import * as E from 'fp-ts/lib/Either'
import {eachLike, like} from '@pact-foundation/pact/src/dsl/matchers'
import log from '../components/log'
import {uidKey} from '../components/budget/hook/useUser'
import {pipe} from 'fp-ts/function'
import * as RTE from 'fp-ts/ReaderTaskEither'

const provider = new Pact({
    consumer: 'BudgetWebsite',
    provider: 'BudgetApiGateway',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'warn',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
})

const at = '2021-05-14T00:00:00.012+08'
const user = 'damoco@easyact.cn'
const makeEvent = (CMD, isExpect = false) => ({...CMD, at: isExpect ? like(at) : at, 'user.id': user})

describe(`功能: 作为用户, 为了注册后保留数据`, () => {

    beforeAll(() => provider.setup())
    afterEach(() => provider.verify())
    afterAll(() => provider.finalize())
    const item = {name: 'food', amount: 10}

    const eventStore1 = new MemEventStore()
    const eventStore2 = new MemEventStore()
    const CMD_IMPORT = {
        type: 'IMPORT_BUDGET',
        user: {id: user},
        to: {version: '0'},
        payload: {assets: [{id: '1', ...item}]},
    }
    const eventImport = makeEvent(CMD_IMPORT)
    const CMD_DELETE = {
        type: 'DELETE_ITEM',
        user: {id: user},
        to: {version: '0'},
        payload: {id: '1', from: 'assets'},
    }
    const eventDelete = makeEvent(CMD_DELETE)
    describe(`场景: 注册后再登录`, () => {
        describe(`假设服务端没有damoco用户\n并且damoco在本地已有试用数据`, () => {
            it(`当damoco注册\n那么从新客户端访问可以拿到所有历史事件`, async () => {
                await provider.addInteraction({
                    state: 'no user',
                    uponReceiving: 'first upload',
                    withRequest: {
                        method: 'POST',
                        path: '/v0/users/damoco@easyact.cn/events',
                        body: {commands: eachLike(CMD_IMPORT)},
                        // body: {events: eachLike(CMD_IMPORT)},
                        headers: {'Content-Type': 'application/json', 'origin': like('http://localhost:3000')},
                        // headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: [makeEvent(CMD_IMPORT, true)]
                    },
                })
                await importBudget(user, {assets: [item]})(eventStore1)()
                const url = provider.mockService.baseUrl
                const r1 = await sync(url, user)(eventStore1)()
                    .then(E.fold(log('sync error'), log('sync success')))
                expect(r1.commands.commands).not.toHaveLength(0)
                expect(r1.commands.beginAt).toBeUndefined()
                expect(r1.events).toStrictEqual([eventImport])
                // await provider.removeInteractions()
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
                        body: [{...CMD_IMPORT, at: like(at), 'user.id': user}]
                    },
                })
                const baseUrl = provider.mockService.baseUrl
                const events1 = await getAllEvents(baseUrl, user)()
                    .then(E.fold(log('client get error'), log('client get success')))
                // const [{at, ...expected}] = await getEvents('damoco', eventStore)
                expect(events1).toEqual([{...CMD_IMPORT, at, 'user.id': user}])
                await provider.verify()
                //场景: 登录
                //场景: 假设服务端damoco用户已经有事件
                const eventImportLike = {...CMD_IMPORT, at: like(at), 'user.id': user}
                const eventDeleteLike = {...CMD_DELETE, at: like(at), 'user.id': user}
                await provider.addInteraction({
                    state: 'damoco has 1 import event',
                    uponReceiving: 'upload',
                    withRequest: {
                        method: 'POST',
                        path: '/v0/users/damoco@easyact.cn/events',
                        headers: {'Content-Type': 'application/json', 'origin': like('http://localhost:3000')},
                        body: {commands: [like(CMD_DELETE)], beginAt: at},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: [eventDeleteLike]
                    },
                })
                await exec(user, CMD_DELETE)(eventStore1)()
                //当damoco登录
                //那么本地命令会叠加在服务端事件列表之上
                const r1_2 = await sync(url, user)(eventStore1)()
                    .then(E.getOrElse(log('Error at 当damoco登录', console.error)))
                expect(r1_2.commands.commands).toEqual([CMD_DELETE])
                expect(r1_2.commands.beginAt).toEqual(at)
                expect(r1_2.events).toEqual([eventDelete])
                await provider.verify()
                // await provider.removeInteractions()
                //场景: 新客户端登录
                //场景: 假设服务端damoco用户已经有事件
                await provider.addInteraction({
                    state: 'damoco has 1 import event',
                    uponReceiving: 'upload from new client',
                    withRequest: {
                        method: 'POST',
                        path: '/v0/users/damoco@easyact.cn/events',
                        headers: {'Content-Type': 'application/json', 'origin': like('http://localhost:3000')},
                        body: {commands: [like(CMD_IMPORT), like(CMD_DELETE)]},
                    },
                    willRespondWith: {
                        status: 200,
                        headers: {'access-control-allow-origin': '*'},
                        body: [eventImportLike, eventImportLike, eventDeleteLike]
                    },
                })
                //并且在一个新客户端damoco在本地有未上传的命令
                localStorage.removeItem(uidKey)
                const unLoginUser = 'default'
                await importBudget(unLoginUser, {assets: [item]})(eventStore2)()
                await exec(unLoginUser, {
                    ...CMD_DELETE,
                    user: {id: unLoginUser}
                })(eventStore2)().then(log('并且damoco在本地有未上传的命令'))
                //当damoco在一个新客户端登录
                //那么本地命令会叠加在服务端事件列表之上
                const r2 = await pipe(
                    migrateEventsToUser(user),
                    RTE.chain(() => sync(url, user))
                )(eventStore2)()
                    .then(E.getOrElse(log('Error at 当damoco在一个新客户端登录', console.error)))
                expect(r2.commands.commands).toHaveLength(2)
                expect(r2.commands.beginAt).toBeUndefined()
                expect(r2.events).toEqual([eventImport, eventImport, eventDelete])
            }, 200000)
        })
    })
})
