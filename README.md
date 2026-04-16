# 6-13-production-deployment

## Setup

1. Edit `server/db/pool.js` and update the user and password fields to match your local Postgres setup (On macOS you may be able to delete those fields entirely)

2. Copy `.env.template` to `.env` and fill in a `SESSION_SECRET` value:

```sh
cp server/.env.template server/.env
```

3. Run these commands to set up the database, seed, and start the server:

```sh
cd server

# Install dependencies
npm install

# Create the database (run once)
createdb users_db           # Mac
sudo -u postgres createdb users_db   # Windows/WSL

# Seed the database
npm run db:seed

# Start the server
npm run dev
```

## Seeded users

| Username | Password    |
| -------- | ----------- |
| alice    | password123 |
| bob      | hunter2     |
| carol    | opensesame  |
