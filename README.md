# Handshake Alerts

SMS alerts when Handshake AI tasks are available. Sign in with your phone, add project IDs, and toggle alerts.

## Local

```bash
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001). The page calls `https://www.readeon.com/api/handshake/*` (`NEXT_PUBLIC_READEON_API_URL`) with `x-from-extension` only on those Handshake requests. Cron runs on Vercel.

We check about every 10 minutes. Default is one alert per project, then polling stops until you turn alerts back on.
