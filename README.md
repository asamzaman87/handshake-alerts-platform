# Handshake Alerts

SMS alerts when Handshake AI tasks are available. Sign in with your phone, add project IDs, and toggle alerts.

## Local

```bash
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001). Browser calls same-origin `/api/handshake/*`, which proxies to production Readeon (`NEXT_PUBLIC_READEON_API_URL`). Cron still runs on Vercel — you do not run a cron job locally.

We check about every 10 minutes. Default is one alert per project, then polling stops until you turn alerts back on.
