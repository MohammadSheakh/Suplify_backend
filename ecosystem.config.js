// this file is for configuring PM2 process manager  // --- suplify
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'suplify-api',
    interpreter: '/home/ubuntu/.nvm/versions/node/v18.19.1/bin/node',
    script: 'node_modules/.bin/ts-node',
    args: 'src/index.ts', // or your entry file
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}