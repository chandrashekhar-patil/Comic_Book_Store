const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'task_log.txt');

function logTaskCompletion(user_id) {
    const logEntry = `${user_id} - Task completed at ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log entry', err);
        }
    });
}

module.exports = { logTaskCompletion };
