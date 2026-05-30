# API Alerts • GitHub Action

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[GitHub Marketplace](https://github.com/marketplace/actions/api-alerts-github-action-notify) • [API Alerts](https://apialerts.com)

Send notifications to your devices directly from GitHub Actions workflows.

This action is a thin convenience wrapper around the [API Alerts JavaScript SDK](https://github.com/apialerts/apialerts-js) for GitHub Actions users. If you'd rather not use an action at all, you can hit the API directly from any workflow step with the [API Alerts CLI](https://github.com/apialerts/cli) or `curl` - see [Alternatives](#alternatives) below.

## Setup

Add your API Alerts workspace API key as a GitHub Actions secret:

1. Go to your repository **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name it `APIALERTS_API_KEY` and paste your API key as the value

Your API key lives in the API Alerts app under **Workspace Settings**.

Expose the secret at the workflow or job level once, and every notify step in that job picks it up automatically:

```yaml
jobs:
  build:
    env:
      APIALERTS_API_KEY: ${{ secrets.APIALERTS_API_KEY }}
    steps:
      - uses: apialerts/notify-action@v2
        with:
          event: ci.build.success
          message: 'Build complete'
```

You can still pass `api_key:` as an input on individual steps if you prefer, but the env var pattern is cleaner when you fire multiple notifications per job.

## Usage

### Single notification

```yaml
- uses: apialerts/notify-action@v2
  with:
    event: ci.deploy.success
    message: '🚀 Production deployed'
```

### Success and failure

Two steps with `if: success()` and `if: failure()` so each branch has its own clean configuration. GitHub Actions skips steps after a failure by default, so the `if:` guards are what make each branch fire.

```yaml
- if: success()
  uses: apialerts/notify-action@v2
  with:
    event: ci.deploy.success
    channel: releases
    message: '🚀 Production deployed'
    tags: deploy,production
    link: 'https://app.example.com'

- if: failure()
  uses: apialerts/notify-action@v2
  with:
    event: ci.deploy.failed
    channel: releases
    message: '❌ Production deploy failed'
    tags: deploy,production
    link: ${{ format('{0}/{1}/actions/runs/{2}', github.server_url, github.repository, github.run_id) }}
```

### Single step with conditional values

Prefer one step over two? Use `if: success() || failure()` with GitHub Actions ternary expressions in the `with:` values. More compact, harder to read once you have more than one or two conditionals.

```yaml
- if: success() || failure()
  uses: apialerts/notify-action@v2
  with:
    event: ${{ job.status == 'success' && 'ci.deploy.success' || 'ci.deploy.failed' }}
    channel: releases
    message: ${{ job.status == 'success' && '🚀 Production deployed' || '❌ Production deploy failed' }}
    tags: deploy,production
    link: ${{ job.status == 'success' && 'https://app.example.com' || format('{0}/{1}/actions/runs/{2}', github.server_url, github.repository, github.run_id) }}
```

### With all options

Every input the action accepts. `data` is a JSON string of arbitrary key-value metadata - useful when non-push destinations (Slack, email, webhooks) need richer context than the message text alone.

```yaml
- uses: apialerts/notify-action@v2
  with:
    event: user.signup
    message: 'New user signed up'
    channel: developers
    title: 'New Signup'
    tags: signup,organic
    link: 'https://dashboard.example.com/users/123'
    data: '{"plan": "pro", "region": "us-east-1", "sha": "${{ github.sha }}"}'
```

## Inputs

`message` is required. Everything else is optional. `api_key` is also optional if `APIALERTS_API_KEY` is set in the environment (recommended).

| Input     | Description                                                                                                                                                                                                           |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `api_key` | API Alerts workspace API key. Optional if `APIALERTS_API_KEY` env var is set.                                                                                                                                         |
| `message` | Human-readable notification text. Required. This is what appears on the push notification lock screen.                                                                                                                |
| `channel` | Workspace channel the push notification fires on. Defaults to the workspace default channel when omitted.                                                                                                             |
| `event`   | Identifies what kind of thing happened. Optional but recommended. Use dotted notation (e.g. `ci.deploy.success`, `payment.failed`, `user.signup`) so routing rules can match glob patterns like `ci.*` or `*.failed`. |
| `title`   | Short headline some destinations render separately from the message body.                                                                                                                                             |
| `tags`    | Comma-separated categorisation tags for filtering and search.                                                                                                                                                         |
| `link`    | URL associated with the event. Available as a deeplink for push notifications and as a call-to-action for routed destinations.                                                                                                                                      |
| `data`    | JSON string of key-value metadata. Available to non-push destinations for templating.                                                                                                                                 |

## Versioning

`@v2` always points at the latest 2.x release. If you need to pin to an exact version, exact semver tags like `@v2.2.0` are also published per release.

## Alternatives

The action is a convenience for the common case. You can hit the same API directly from any workflow step without using the action at all.

### npx CLI

```yaml
- name: Notify
  env:
    APIALERTS_API_KEY: ${{ secrets.APIALERTS_API_KEY }}
  run: npx @apialerts/cli send -e ci.deploy.success -m "Production deployed"
```

Same flags you'd use locally. Slower cold start while npx fetches the package, but no action indirection. See the [CLI reference](https://apialerts.com/docs/tools/cli).

### curl

```yaml
- name: Notify
  run: |
    curl -X POST https://api.apialerts.com/event \
      -H "Authorization: Bearer ${{ secrets.APIALERTS_API_KEY }}" \
      -H "Content-Type: application/json" \
      -d '{"event":"ci.deploy.success","message":"Production deployed"}'
```

Zero dependencies. Useful in containers without Node, or when you want full control of the HTTP request shape.

### When to use which

|                      | Action                               | CLI via npx                                 | curl                                       |
|----------------------|--------------------------------------|---------------------------------------------|--------------------------------------------|
| Setup                | `uses:` line                         | One env var                                 | Nothing                                    |
| Syntax               | Named `with:` inputs                 | CLI flags                                   | Raw JSON                                   |
| Cold start           | Fast (bundled JS, Node preinstalled) | Slower (npm fetch)                          | Fast                                       |
| Marketplace presence | Yes                                  | No                                          | No                                         |
| Best for             | Most workflows                       | Power users who already use the CLI locally | Air-gapped or minimal-runtime environments |

## Links

- [Documentation](https://apialerts.com/docs/integrations/github-actions)
- [Sign up](https://apialerts.com)
- [GitHub Issues](https://github.com/apialerts/notify-action/issues)
