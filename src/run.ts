import * as core from '@actions/core'
import { ApiAlerts } from 'apialerts'

export const INTEGRATION = 'notify-action'
export const VERSION = '2.1.0'

export async function run(): Promise<void> {
    const apiKey = core.getInput('api_key', { required: true })
    const message = core.getInput('message', { required: true })

    const channel = core.getInput('channel') || undefined
    const event = core.getInput('event') || undefined
    const title = core.getInput('title') || undefined
    const link = core.getInput('link') || undefined

    const tagsRaw = core.getInput('tags')
    const tags = tagsRaw
        ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
        : undefined

    const dataRaw = core.getInput('data')
    let data: Record<string, unknown> | undefined
    if (dataRaw) {
        try {
            data = JSON.parse(dataRaw)
        } catch {
            core.setFailed('Invalid JSON provided for "data" input')
            return
        }
    }

    ApiAlerts.configure(apiKey)
    ApiAlerts.setOverrides(INTEGRATION, VERSION)

    const result = await ApiAlerts.sendAsync({ message, channel, event, title, tags, link, data })
    if (!result.success) {
        core.setFailed(result.error ?? 'Failed to send alert')
        return
    }

    core.info(`✓ (apialerts.com) Alert sent to ${result.workspace} (${result.channel})`)
    for (const warning of result.warnings) {
        core.warning(`(apialerts.com) ${warning}`)
    }
}
