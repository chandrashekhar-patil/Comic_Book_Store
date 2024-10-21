const express = require('express');
const bodyParser = require('body-parser');
const { addTaskToQueue } = require('./taskQueue');
const logger = require('./logger');

const app = express();
app.use(bodyParser.json());

app.post('/api/v1/task', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        await addTaskToQueue(user_id);
        res.status(202).json({ message: 'Task added tno the queue' });
    } catch (error) {
        res.status(500).json({ error: 'Task processing failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
