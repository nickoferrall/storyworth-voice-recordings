# Local Development Setup

This document explains how to safely develop locally without affecting production data.

## ⚠️ Prerequisites

- **Node.js >= 18.18.0** (required for Next.js)
  - Check your version: `node --version`
  - Update if needed: Use [nvm](https://github.com/nvm-sh/nvm) or download from [nodejs.org](https://nodejs.org/)

## 🚀 Quick Start

1. **Start local Supabase**: `yarn supabase:start`
2. **Check environment**: `yarn env:info`
3. **Run locally**: `yarn dev:local`

## 🔧 Environment Management

### Available Environments

- **Development** (`yarn dev:local`): Uses local Supabase database
- **Production** (`yarn dev:prod`): Uses production database ⚠️ **DANGEROUS**

### Environment Files

- `.env.dev` - Local development configuration (safe)
- `.env.prod` - Production configuration (create manually, never commit)

## 📊 Database Operations

### Safe Operations (Local)

```bash
yarn migrate:local      # Run migrations against local DB
yarn migrate:down:local # Rollback migrations on local DB
yarn dev:local          # Run app with local database
```

### Dangerous Operations (Production)

```bash
yarn migrate:prod       # ⚠️ Run migrations against PRODUCTION
yarn migrate:down:prod  # ⚠️ Rollback migrations on PRODUCTION
yarn dev:prod          # ⚠️ Run app with PRODUCTION database
```

## 🔒 Safety Features

### Automatic Environment Detection

- **Development mode** (`NODE_ENV=development`): Automatically loads `.env.dev`
- **Production mode** (`NODE_ENV=production`): Automatically loads `.env.prod`

### User Creation Safety

✅ **Fixed**: All user creation now respects environment settings:

- `signUp` mutation uses local Supabase in development
- `login` mutation uses local Supabase in development
- `supabaseAdmin` client uses local Supabase in development
- Database connections use local PostgreSQL in development

### Email Safety

✅ **Centralized**: All emails are blocked in non-production environments via `MailgunManager`

## 🧪 Verification Commands

```bash
yarn env:info           # Check current environment configuration
yarn supabase:status    # Check local Supabase status
yarn supabase:reset     # Reset local database and reload seed data
```

## 🚨 Troubleshooting

### "Node.js version >= v18.18.0 is required"

Update Node.js to version 18.18.0 or higher:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### "User created in production database"

This should no longer happen after our fixes. If it does:

1. Check `yarn env:info` shows local URLs
2. Ensure you're using `yarn dev:local` (not `yarn dev`)
3. Check console logs for environment loading messages

### Local Supabase not working

```bash
yarn supabase:stop
yarn supabase:start
yarn supabase:reset  # If you need fresh data
```

## 🎯 Best Practices

1. **Always use `yarn dev:local`** for development
2. **Never commit `.env.prod`** or production credentials
3. **Check `yarn env:info`** before making database changes
4. **Use `yarn supabase:reset`** to get fresh test data
5. **Update Node.js** to the latest LTS version

## 📁 File Structure

```
.env.dev           # Local development config (committed)
.env.prod          # Production config (never commit)
.env.prod.example  # Template for production config
supabase/          # Local Supabase configuration
├── config.toml    # Supabase settings
├── migrations/    # SQL migrations for Supabase
└── seed.sql       # Test data for development
```

---

## ✅ Environment Status

When properly configured, you should see:

- 🟢 Local Supabase URL: `http://127.0.0.1:54321`
- 🟢 Local Database: `127.0.0.1:54322`
- 🟢 No emails sent in development
- 🟢 All user creation goes to local database
