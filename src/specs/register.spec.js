import path from 'path'
import {Pact} from '@pact-foundation/pact'
import {eachLike} from '@pact-foundation/pact/src/dsl/matchers'

const provider = new Pact({
    consumer: 'BudgetWebsite',
    provider: 'BudgetApiGateway',
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    logLevel: 'debug',
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2
})
describe(`功能: 作为新用户, 为了注册后保留数据`, () => {

    beforeAll(() => provider.setup())
    afterEach(() => provider.verify())
    afterAll(() => provider.finalize())

    describe(`场景: 注册`, () => {
        describe(`假设服务端没有damoco用户`, () => {
            describe(`当damoco注册`, () => {
                it(`那么简单将本地数据上传到服务器`, async () => {
                    // set up Pact interactions
                    await provider.addInteraction({
                        state: 'products exist',
                        uponReceiving: 'get all products',
                        withRequest: {
                            method: 'GET',
                            path: '/products'
                        },
                        willRespondWith: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json; charset=utf-8'
                            },
                            body: eachLike({
                                id: '09',
                                type: 'CREDIT_CARD',
                                name: 'Gem Visa'
                            }),
                        },
                    })

                    const api = new API(provider.mockService.baseUrl)

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
