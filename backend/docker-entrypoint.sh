#!/bin/sh
set -e
npx prisma db push
if [ "$RUN_SEED" = "true" ]; then
  npm run seed
fi
exec node dist/index.js
