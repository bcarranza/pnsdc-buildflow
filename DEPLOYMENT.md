# PNSDC-buildFlow Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account (free tier works)
- Supabase project configured

## Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for browser) | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | Supabase → Settings → API |

**Important:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client

## Deployment Steps

### Option A: Vercel CLI (Quick)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for project setup)
cd pnsdc-buildflow
vercel

# Deploy to production
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add each variable from the table above
   - Set them for Production, Preview, and Development
6. Click "Deploy"

## Verifying Deployment

After deployment:

1. **Check HTTPS**: URL should start with `https://`
2. **Test Page Load**: Should load in < 3 seconds
3. **Check Console**: No JavaScript errors
4. **Test on Mobile**: Use Chrome DevTools device emulation

## Updating the Deployment

With GitHub integration:
- Push to `main` branch → automatic production deploy
- Push to other branches → preview deployments

With CLI:
```bash
vercel --prod
```

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Run `npm run build` locally to see errors

### Database Connection Fails
- Verify Supabase URL is correct
- Check that RLS policies allow the operations
- Ensure service role key is set for admin operations

### Page Loads Slowly
- Check Vercel Analytics for performance metrics
- Ensure images are optimized
- Consider enabling Vercel Edge caching
