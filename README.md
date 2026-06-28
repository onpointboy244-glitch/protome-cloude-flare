# protome

A link-in-bio profile builder. Create beautiful, shareable profile pages.

## Stack

- **Frontend**: React 19 + Vite 8
- **Backend**: Supabase (auth, database, storage)
- **Server**: Cloudflare Pages Functions (replaces Express)
- **Hosting**: Cloudflare Pages

## Development

```bash
npm run dev       # Vite dev server on :5173
npm run build     # Production build to dist/
```

The Cloudflare Pages Function (OG meta injection + report API) runs in production only. For local testing of the function:

```bash
npm run pages:dev # Build + serve with wrangler (includes the function)
```

## Deploy

### Via CLI (first time)

```bash
# 1. Create the Pages project (one-time)
npx wrangler pages project create protome

# 2. Set environment variables in the dashboard
#    Pages > protome > Settings > Environment variables
#    - SUPABASE_URL
#    - SUPABASE_ANON_KEY

# 3. Deploy
npm run build
npx wrangler pages deploy dist/ --branch main
```

### Via GitHub Actions (automatic)

Push to `main` branch — the `.github/workflows/deploy.yml` workflow builds
and deploys automatically. Requires `CLOUDFLARE_API_TOKEN` secret in GitHub.

### Environment variables

Set these in the Cloudflare Pages dashboard:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |

The client-side `VITE_SUPABASE_*` vars go in `.env` for local dev.

## Project structure

```
├── functions/
│   └── [[path]].js     Cloudflare Pages Function (OG meta, report API, SPA)
├── src/
│   ├── components/     React components
│   ├── lib/            API layer, auth, Supabase client
│   ├── App.jsx         Main app with routing
│   ├── main.jsx        Entry point
│   └── index.css       Design tokens & global styles
├── public/             Static assets
├── dist/               Build output (gitignored)
└── vite.config.js
```
