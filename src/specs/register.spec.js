import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {eachLike} from '@pact-foundation/pact/src/dsl/matchers'
import {BudgetEsService} from '../components/budget/service/budgetEsService'
import {MemEventStore} from '../components/es/lib/eventStore'

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
    const item = {name: 'TI', type: 'assets'}

    describe(`场景: 注册`, () => {
        describe(`假设服务端没有damoco用户\n并且damoco在本地已有试用数据`, () => {
            beforeEach(() => new BudgetEsService('default', new MemEventStore()).exec({type: 'IMPORT_BUDGET', payload: {}}))
            describe(`当damoco注册`, () => {
                it(`那么简单将本地数据上传到服务器`, async () => {
                    await provider.addInteraction({
                        state: 'no user',
                        uponReceiving: 'first upload',
                        withRequest: {
                            method: 'POST',
                            path: '/v0/users/damoco@easyact.cn/events',
                            body: eachLike({
                                id: '09',
                                type: 'PUT_ITEM',
                                at: '2021-05-14T00:00:00.012+08'
                            })
                        },
                        willRespondWith: {
                            status: 200,
                        },
                    })

                    const api = new RestApi(provider.mockService.baseUrl)

                    // make request to Pact mock server
                    const product = await api.getAllProducts()
                    expect(product).toStrictEqual([
                        {'id': '09', 'name': 'Gem Visa', 'type': 'CREDIT_CARD'}
                    ])
                })
            })
        })
    })
})
