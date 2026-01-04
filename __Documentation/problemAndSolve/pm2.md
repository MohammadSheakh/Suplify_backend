https://devhints.io/pm2

pnpm install --save-dev pm2


pnpm pm2 start ecosystem.config.js  // start with config file 

pnpm pm2 list

pnpm pm2 delete suplify-api  // delete 
pnpm pm2 delete 0

pnpm pm2 logs suplify-api --lines 100   // to see last 100 lines of log
pnpm pm2 logs suplify-api
pnpm pm2 logs suplify-api --err

pnpm pm2 info suplify-api

*************************************** FINAL VERSION
** TO RUN
pnpm pm2 start src/serverV2.ts -f --interpreter=ts-node --node-args="--transpile-only" --name suplify-api
** TO SEE LOGS
less /home/mohammadsheakh/.pm2/logs/suplify-api-out.log

Navigation commands in less:
↑/↓ arrows - Move up/down one line
Page Up/Page Down - Move up/down one screen
Space - Move down one screen (same as Page Down)
b - Move back one screen (same as Page Up)
Home - Go to beginning of file
End or G - Go to end of file
g - Go to beginning of file
q - Quit and return to terminal
----------------

pm2 start npm --name "suplify-api" -- run dev
pm2 start pnpm --name "suplify-api" -- run dev

cat ~/.pm2/logs/suplify-api-error.log | tail -n 50
cat ~/.pm2/logs/suplify-api-out.log | tail -n 50

pnpm pm2 monit

sudo apt update && sudo apt install htop
htop


—-------------------------------------------------------------------------------------

pnpm ts-node --showConfig

—---------------------------------------- start backend 

pm2 kill
rm -rf ~/.pm2

pm2 start src/serverV2.ts \
  --name suplify-api \
  --interpreter ./node_modules/.bin/ts-node \
  --node-args="--transpile-only"


//================================================

pnpm install --save-dev pm2

pnpm pm2 start src/serverV2.ts -f --interpreter=ts-node --name suplify-api

pnpm pm2 start src/serverV2.ts -f --interpreter=ts-node --node-args="--transpile-only" --name suplify-api

pnpm pm2 start src/serverV2.ts \
  --name suplify-api \
  --interpreter ts-node \
  --interpreter-args "--transpile-only"


TS_NODE_PROJECT=tsconfig.json \
TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}' \
pnpm pm2 start src/serverV2.ts \
  --interpreter ./node_modules/.bin/ts-node \
  --node-args="--transpile-only" \
  --name suplify-api



pnpm pm2 delete 0

# View logs to see errors
pnpm pm2 logs suplify-api

# Or view logs with errors only
pnpm pm2 logs suplify-api --err

# Check detailed process info
pnpm pm2 show 1

pnpm pm2 info suplify-api





