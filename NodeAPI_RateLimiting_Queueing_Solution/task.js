async function task(user_id) {
    console.log(`${user_id}-task completed at-${Date.now()}`);
}

module.exports = { task };
