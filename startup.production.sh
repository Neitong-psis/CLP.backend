#!/usr/bin/env bash
set -e

# Run migration directly without env-cmd so Railway injected vars are used
ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js --dataSource=src/database/data-source.ts migration:run
npm run seed:run:relational
node dist/main
