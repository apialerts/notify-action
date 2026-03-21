# API Alerts • GitHub Action

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[GitHub Marketplace](https://github.com/marketplace/actions/api-alerts-github-action-notify) • [API Alerts](https://apialerts.com)

Send notifications to your devices directly from GitHub Actions workflows.

## Setup

Add your API Alerts workspace API key as a GitHub Actions secret:

1. Go to your repository **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name it `APIALERTS_API_KEY` and paste your API key as the value

Your API key can be found in the API Alerts app under **Workspace Settings**.

## Usage

```yaml
- uses: apialerts/notify-action@v2
  with:
    api_key: ${{ secrets.APIALERTS_API_KEY }}
    message: 'Deployment successful'
```

## Inputs

| Input     | Required | Description                                                                    |
|-----------|----------|--------------------------------------------------------------------------------|
| `api_key` | Yes      | Your API Alerts workspace API key                                              |
| `message` | Yes      | Notification message                                                           |
| `channel` | No       | Channel to send to. If not provided or invalid, the workspace default is used  |
| `event`   | No       | Event key for routing and filtering                                            |
| `title`   | No       | Short title for the notification                                               |
| `tags`    | No       | Comma-separated list of tags                                                   |
| `link`    | No       | URL to attach to the notification                                              |
| `data`    | No       | JSON string of key-value metadata                                              |

## Example

```yaml
- uses: apialerts/notify-action@v2
  with:
    api_key: ${{ secrets.APIALERTS_API_KEY }}
    message: 'Production deployed'
    channel: 'releases'
    event: 'ci.deploy'
    title: 'Deployed'
    tags: 'CI/CD,Production'
    link: '${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
    data: '{"sha": "${{ github.sha }}"}'
```

## Links

- [Documentation](https://apialerts.com/docs)
- [Sign up](https://apialerts.com)
- [GitHub Issues](https://github.com/apialerts/notify-action/issues)
