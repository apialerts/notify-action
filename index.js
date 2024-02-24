const core = require('@actions/core')
const alerts = require('@apialerts/js')

try {
    alerts.send({
        message: core.getInput('message'),
        api_key: core.getInput('api_key')
    })
} catch (error) {
    core.setFailed(error.message)
}