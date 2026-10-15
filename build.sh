#!/usr/bin/env bash
set -e
cd cocobod-app
export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
npm install
npm run build
