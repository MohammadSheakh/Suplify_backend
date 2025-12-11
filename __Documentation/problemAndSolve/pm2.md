pnpm install --save-dev pm2

pnpm pm2 start src/serverV2.ts -f --interpreter=ts-node --name suplify-api

pnpm pm2 start src/serverV2.ts -f --interpreter=ts-node --node-args="--transpile-only" --name suplify-api

pnpm pm2 delete 0

# View logs to see errors
pnpm pm2 logs suplify-api

# Or view logs with errors only
pnpm pm2 logs suplify-api --err

# Check detailed process info
pnpm pm2 show 1



