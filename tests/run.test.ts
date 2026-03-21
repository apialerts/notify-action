import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const { mockGetInput, mockSetFailed, mockInfo, mockWarning } = vi.hoisted(() => ({
    mockGetInput: vi.fn(),
    mockSetFailed: vi.fn(),
    mockInfo: vi.fn(),
    mockWarning: vi.fn(),
}))

vi.mock('@actions/core', () => ({
    getInput: mockGetInput,
    setFailed: mockSetFailed,
    info: mockInfo,
    warning: mockWarning,
}))

const { mockSendAsync, mockSetOverrides } = vi.hoisted(() => ({
    mockSendAsync: vi.fn(),
    mockSetOverrides: vi.fn(),
}))

vi.mock('apialerts', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ApiAlertsClient: vi.fn(function (this: any) {
        this.sendAsync = mockSendAsync
        this.setOverrides = mockSetOverrides
    }),
}))

import { run, INTEGRATION, VERSION } from '../src/run.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockInputs(inputs: Record<string, string>): void {
    mockGetInput.mockImplementation((name: string) => inputs[name] ?? '')
}

function successResult(workspace = 'My Workspace', channel = 'general', warnings: string[] = []) {
    return { success: true, workspace, channel, warnings }
}

// ── Constants ─────────────────────────────────────────────────────────────────

describe('constants', () => {
    it('integration name is notify-action', () => {
        expect(INTEGRATION).toBe('notify-action')
    })

    it('version is a valid semver string', () => {
        expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
    })
})

// ── Setup ─────────────────────────────────────────────────────────────────────

afterEach(() => vi.clearAllMocks())

// ── Success ───────────────────────────────────────────────────────────────────

describe('success', () => {
    it('sends minimal alert and logs result', async () => {
        mockInputs({ api_key: 'test-key', message: 'Deploy complete' })
        mockSendAsync.mockResolvedValue(successResult('My Workspace', 'general'))

        await run()

        expect(mockSendAsync).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Deploy complete',
        }))
        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('My Workspace'))
        expect(mockSetFailed).not.toHaveBeenCalled()
    })

    it('sends all fields', async () => {
        mockInputs({
            api_key: 'test-key',
            message: 'Deploy complete',
            channel: 'releases',
            event: 'ci.deploy',
            title: 'Deployed',
            tags: 'CI/CD, JS',
            link: 'https://github.com',
            data: '{"version": "1.4"}',
        })
        mockSendAsync.mockResolvedValue(successResult('My Workspace', 'releases'))

        await run()

        expect(mockSendAsync).toHaveBeenCalledWith({
            message: 'Deploy complete',
            channel: 'releases',
            event: 'ci.deploy',
            title: 'Deployed',
            tags: ['CI/CD', 'JS'],
            link: 'https://github.com',
            data: { version: '1.4' },
        })
        expect(mockSetFailed).not.toHaveBeenCalled()
    })

    it('surfaces warnings', async () => {
        mockInputs({ api_key: 'test-key', message: 'test' })
        mockSendAsync.mockResolvedValue(successResult('W', 'C', ['deprecated field used']))

        await run()

        expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('deprecated field used'))
    })

    it('sets notify-action override headers', async () => {
        mockInputs({ api_key: 'test-key', message: 'test' })
        mockSendAsync.mockResolvedValue(successResult())

        await run()

        expect(mockSetOverrides).toHaveBeenCalledWith(INTEGRATION, VERSION)
    })
})

// ── Failure ───────────────────────────────────────────────────────────────────

describe('failure', () => {
    it('calls setFailed when result is not successful', async () => {
        mockInputs({ api_key: 'test-key', message: 'test' })
        mockSendAsync.mockResolvedValue({ success: false, error: 'unauthorized — check your API key', warnings: [] })

        await run()

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('unauthorized'))
        expect(mockInfo).not.toHaveBeenCalled()
    })

    it('calls setFailed with fallback message when error is missing', async () => {
        mockInputs({ api_key: 'test-key', message: 'test' })
        mockSendAsync.mockResolvedValue({ success: false, warnings: [] })

        await run()

        expect(mockSetFailed).toHaveBeenCalledWith('Failed to send alert')
    })

    it('calls setFailed for invalid data JSON', async () => {
        mockInputs({ api_key: 'test-key', message: 'test', data: 'not-json' })

        await run()

        expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON'))
        expect(mockSendAsync).not.toHaveBeenCalled()
    })
})

// ── Input handling ────────────────────────────────────────────────────────────

describe('input handling', () => {
    beforeEach(() => mockSendAsync.mockResolvedValue(successResult()))

    it('omits optional fields when empty', async () => {
        mockInputs({ api_key: 'test-key', message: 'test' })

        await run()

        expect(mockSendAsync).toHaveBeenCalledWith({
            message: 'test',
            channel: undefined,
            event: undefined,
            title: undefined,
            tags: undefined,
            link: undefined,
            data: undefined,
        })
    })

    it('splits comma-separated tags and trims whitespace', async () => {
        mockInputs({ api_key: 'test-key', message: 'test', tags: 'CI/CD , JS , deploy' })

        await run()

        expect(mockSendAsync).toHaveBeenCalledWith(expect.objectContaining({
            tags: ['CI/CD', 'JS', 'deploy'],
        }))
    })

    it('parses data as JSON object', async () => {
        mockInputs({ api_key: 'test-key', message: 'test', data: '{"env": "prod", "version": 2}' })

        await run()

        expect(mockSendAsync).toHaveBeenCalledWith(expect.objectContaining({
            data: { env: 'prod', version: 2 },
        }))
    })
})
