# GitHub Actions Integration

Simple integration with the API Alerts platform to send a notification to your device during a GitHub action pipeline.

## Inputs

### `api_key`

**Required** API Key of the project to notify. 

Get your projects API Key from the Projects Page in the mobile app.

### `message`

**Required** The notification message to be sent to your devices

### `tags`

**Optional** Comma separated list of tags to attach to the event.

### `link`

**Optional** Link to attach to the event

## Example usage

Minimal usage
```yaml
- name: API Alerts Notify
  uses: apialerts/notify-action@v1
  with:
    api_key: ${{ secrets.API_ALERTS_KEY }}
    message: 'Production website deployed'
```

Full usage
```yaml
- name: API Alerts Notify
  uses: apialerts/notify-action@v1
  with:
    api_key: ${{ secrets.API_ALERTS_KEY }}
    message: 'Production website deployed'
    tags: 'Deploy,Production,Web,CI/CD'
    link: 'https://apialerts.com'
```

Tip: Create a new GitHub action secret in your repository with the name `API_ALERTS_KEY` to secure your project key.
