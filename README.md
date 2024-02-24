# API Alerts - GitHub Action Notifications

Simple integration with the API Alerts platform to send a notification to your device during a GitHub action pipeline.

## Inputs

### `api_key`

**Required** API Key of the project to notify. 

Get your projects API Key from the Projects Page in the mobile app.

### `message`

**Required** The notification message to be sent to your devices

## Example usage

```yaml

- name: API Alerts Notify
  uses: apialerts/notify-action@v0
  with:
    api_key: ${{ secrets.API_ALERTS_KEY }}
    message: 'Production website deployed'
```

Tip: Create a new GitHub action secret in your repository with the name `API_ALERTS_KEY`.

## Development Notes

Commands to build dist/index.js

```bash
npm i -g @vercel/ncc
ncc build index.js --license licenses.txt
```

