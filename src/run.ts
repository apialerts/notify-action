import * as core from '@actions/core'
import { ApiAlerts } from 'apialerts'

export const INTEGRATION = 'notify-action'
export const VERSION = '2.2.0'

export async function run(): Promise<void> {
    const apiKey = core.getInput('api_key') || process.env.APIALERTS_API_KEY || ''
    if (!apiKey.trim()) {
        core.setFailed('api_key is required (set the input or APIALERTS_API_KEY env var)')
        return
    }

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

    core.info(`Alert sent to ${result.workspace} (${result.channel})`)
    for (const warning of result.warnings) {
        core.warning(warning)
    }
}
