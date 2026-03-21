import { ApiAlerts } from 'apialerts'

const args = process.argv.slice(2)
const isBuild = args.includes('--build')
const isRelease = args.includes('--release')
const isPublish = args.includes('--publish')
const isIntegrationTests = args.includes('--integration-tests')

const channelIndex = args.indexOf('--channel')
const channel = channelIndex !== -1 ? args[channelIndex + 1] : 'testing'

const apiKey = process.env.APIALERTS_API_KEY
if (!apiKey) {
    console.error('Error: APIALERTS_API_KEY is not set')
    process.exit(1)
}

const link = 'https://github.com/apialerts/notify-action/actions'

ApiAlerts.configure(apiKey)

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
    if (isBuild) {
        handleResult(await ApiAlerts.sendAsync({
            message: 'Notify Action - PR build passed',
            channel: 'developer',
            event: 'ci.build',
            title: 'Build Passed',
            tags: ['CI/CD', 'Notify Action'],
            link,
        }))

    } else if (isRelease) {
        handleResult(await ApiAlerts.sendAsync({
            message: 'Notify Action - release build passed',
            channel: 'developer',
            event: 'ci.release',
            title: 'Release Build Passed',
            tags: ['CI/CD', 'Notify Action'],
            link,
        }))

    } else if (isPublish) {
        handleResult(await ApiAlerts.sendAsync({
            message: 'Notify Action - published',
            channel: 'releases',
            event: 'ci.publish',
            title: 'Published',
            tags: ['CI/CD', 'Notify Action'],
            link,
        }))

    } else if (isIntegrationTests) {
        handleResult(await ApiAlerts.sendAsync({
            message: 'Notify Action - minimal',
            channel,
        }))

        handleResult(await ApiAlerts.sendAsync({
            message: 'Notify Action - full',
            channel,
            event: 'sdk.test',
            title: 'Integration Test',
            tags: ['CI/CD', 'Notify Action'],
            link,
            data: { version: '2.1.0' },
        }))

    } else {
        console.error('Error: pass --build, --release, --publish, or --integration-tests')
        process.exit(1)
    }
}

main()
