import {Verifier} from '@pact-foundation/pact'
import path from 'path'

const providerName = 'stage'
// const port = 80
const providerBaseUrl = `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn/`
// const providerBaseUrl = `https://m99jy17a13.execute-api.cn-northwest-1.amazonaws.com.cn/dev`
describe('Pact Verification', () => {
    const opts = {
        provider: providerName,
        providerBaseUrl,
        pactUrls: [path.resolve(process.cwd(), 'pacts', 'budgetwebsite-budgetapigateway.json')],
        publishVerificationResult: true,
        consumerVersionTags: ['dev'],
        providerVersion: '1.0.' + process.env.HOSTNAME,
        // verbose: true,
        stateHandlers: {
            'no user': () => fetch(`${providerBaseUrl}v0/users/damoco@easyact.cn/events`, {method: 'DELETE'})
        }
    }

    it('should validate the expectations of Order Web', () => {
        return new Verifier(opts).verifyProvider()
    }, 20000)
})