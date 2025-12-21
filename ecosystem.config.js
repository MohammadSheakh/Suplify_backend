// this file is for configuring PM2 process manager  // --- suplify
// ecosystem.config.js

// module.exports = {
//   apps: [{
//     name: 'suplify-api',
//     interpreter: '/home/ubuntu/.nvm/versions/node/v18.19.1/bin/node',
//     script: 'node_modules/.bin/ts-node',
//     args: 'src/index.ts', // or your entry file
//     instances: 1,
//     autorestart: true,
//     watch: false,
//     max_memory_restart: '1G',
//     env: {
//       NODE_ENV: 'production'
//     }
//   }]
// }

module.exports = {
  apps: [
    {
      name: 'suplify-api',
      script: './src/serverV2.ts',
      interpreter: './node_modules/.bin/ts-node', // Use local ts-node (important!)
      exec_interpreter: '/home/ubuntu/.nvm/versions/node/v18.19.1/bin/node',  // Full path to v18 binary
      interpreter_args: '--transpile-only',      // Pass args to ts-node
      cwd: './',                                 // Working directory
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      // Optional: specify Node.js version path if using nvm
      // node: '/home/ubuntu/.nvm/versions/node/v18.19.1/bin/node',
    },
  ],
};

// -- to start this .. pnpm pm2 delete suplify-api
// ---                 pnpm pm2 start ecosystem.config.js


