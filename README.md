# Handshake Alerts

SMS alerts when Handshake AI tasks are available. Sign in with your phone, add project IDs, and toggle alerts.

## Local

```bash
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001). The API is production Readeon-UI (`NEXT_PUBLIC_READEON_API_URL`, default `https://www.readeon.com`). Cron runs on Vercel against that backend — you do not run a cron job locally.

We check about every 10 minutes. Default is one alert per project, then polling stops until you turn alerts back on.
