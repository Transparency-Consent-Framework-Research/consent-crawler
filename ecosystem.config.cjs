module.exports = {
  apps : [{
    name   : "consent-crawler",
    script : "npm run start:prod",
    // exec_mode: 'cluster', 
    // max_memory_restart: '8G',
    kill_timeout: 5000,
    autorestart: true,
    // cron_restart: '0 */12 * * *',
    instaces: 1,
    max_restarts: 20,
    min_uptime: 20000,
    // env: {
    //   "CRAWLEE_MEMORY_MBYTES": 6000,
    // }
  }]
}
