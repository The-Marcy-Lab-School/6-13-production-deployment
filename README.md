# 6-13-production-deployment

## Setup

Follow these steps to get the server up and running. It currently uses hard-coded values to set up `pool.js` and the `cookie-session` middleware. In the TODOs below, you will fix that!

1. Edit `server/db/pool.js` and update the user and password fields to match your local Postgres setup (On macOS you may be able to delete those fields entirely)

2. Run these commands to set up the database, seed, and start the server:

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

Note: If you get an error `connection to server on socket "/tmp/.s.PGSQL.5432" failed: No such file or directory`, double check that Postgres is running

## Seeded users

| Username | Password    |
| -------- | ----------- |
| alice    | password123 |
| bob      | hunter2     |
| carol    | opensesame  |

## TODOs

Complete these TODOs to prepare your application for deployment.

**Project Setup**
- [ ] Copy the `.env.template` file to create a `.env` file with Posgres connection variables filled in and a `SESSION_SECRET`
- [ ] Install `dotenv`

**pool.js**
- [ ] Use `require('dotenv').config()` to load environment variables
- [ ] Use `process.env` variables to create `devConfig` and `prodConfig` objects
  - [ ] If `process.env.PG_CONNECTION_STRING` is available, invoke `new Pool()` with the `prodConfig`
  - [ ] Otherwise, invoke `newPool()` with the `devConfig`

**index.js**
- [ ] Use `require('dotenv').config()` to load environment variables
- [ ] Use `process.env.SESSION_SECRET` when configuring the `cookieSession` middleware
