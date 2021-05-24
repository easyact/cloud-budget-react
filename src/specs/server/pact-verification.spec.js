import {Verifier} from '@pact-foundation/pact'
import path from 'path'

const providerName = 'stage'
const port = 80
describe('Pact Verification', () => {
    const opts = {
        provider: providerName,
        providerBaseUrl: `https://easyact.cn:${port}/api`,
        pactUrls: [path.resolve(process.cwd(), 'pacts', 'budgetwebsite-budgetapigateway.json')],
        publishVerificationResult: true,
        tags: ['prod'],
        providerVersion: '1.0.' + process.env.HOSTNAME,
    }

    it('should validate the expectations of Order Web', () => {
        return new Verifier().verifyProvider(opts)
    })
})
