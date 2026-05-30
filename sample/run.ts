// Integration test entry point called by the apialerts/integration-tests
// harness. Sends a minimal and a full event to a real workspace.
import { ApiAlerts } from 'apialerts'
import { INTEGRATION, VERSION } from '../src/run'

const args = process.argv.slice(2)
const channelIndex = args.indexOf('--channel')
const channel = channelIndex !== -1 ? args[channelIndex + 1] : 'testing'

const apiKey = process.env.APIALERTS_API_KEY
if (!apiKey) {
    console.error('Error: APIALERTS_API_KEY is not set')
    process.exit(1)
}

const link = 'https://github.com/apialerts/notify-action/actions'

ApiAlerts.configure(apiKey)
ApiAlerts.setOverrides(INTEGRATION, VERSION)

function handleResult(result: Awaited<ReturnType<typeof ApiAlerts.sendAsync>>): void {
    if (!result.success) {
        console.error(`Error: ${result.error}`)
        process.exit(1)
    }
    console.log(`✓ sent to ${result.workspace} (${result.channel})`)
    for (const w of result.warnings) {
        console.warn(`! Warning: ${w}`)
    }
}

async function main(): Promise<void> {
    handleResult(await ApiAlerts.sendAsync({
        message: 'Notify Action - minimal',
        channel,
    }))

    handleResult(await ApiAlerts.sendAsync({
        message: 'Notify Action - full',
        channel,
        event: 'sdk.integration.test',
        title: 'Integration Test',
        tags: ['CI/CD', 'Notify Action'],
        link,
        data: { version: VERSION },
    }))
}

main()
