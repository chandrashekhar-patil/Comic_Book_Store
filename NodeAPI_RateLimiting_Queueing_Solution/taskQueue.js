const Redis = require('ioredis');
const { task } = require('./task');
const redis = new Redis();
const logger = require('./logger');

const TASKS_PER_SECOND = 1;
const TASKS_PER_MINUTE = 20;

async function addTaskToQueue(user_id) {
    const currentTime = Date.now();
    const oneMinuteAgo = currentTime - 60000;

    const taskCount = await redis.lrange(`user:${user_id}:tasks`, 0, -1);

    if (taskCount.length >= TASKS_PER_MINUTE) {
        throw new Error('Rate limit exceeded (20 tasks per minute)');
    }

    const taskWithinLastSecond = taskCount.find(timestamp => currentTime - timestamp < 1000);
    if (taskWithinLastSecond) {
        throw new Error('Rate limit exceeded (1 task per second)');
    }

    await redis.rpush(`user:${user_id}:tasks`, currentTime);
    await redis.expire(`user:${user_id}:tasks`, 60);

    await processTask(user_id);
}

async function processTask(user_id) {
    try {
        await task(user_id);
        logger.logTaskCompletion(user_id);
    } catch (err) {
        console.error(`Task processing failed for user ${user_id}`, err);
    }
}

module.exports = { addTaskToQueue };
