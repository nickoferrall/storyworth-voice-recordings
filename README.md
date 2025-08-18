# Fitlo

Fitlo is software that helps gyms organize fitness competitions like HYROX Simulations and CrossFit.

## E2E Testing with Supabase Branching

We use [Supabase Branching](https://supabase.com/docs/guides/deployment/branching) to create isolated preview databases for E2E testing. This ensures tests don't interfere with production data.

### How It Works

1. **Each PR gets its own database**: When you create a pull request, Supabase automatically creates a preview branch with an isolated database
2. **Automatic migrations**: **Your** existing TypeScript migrations in `src/db/migrations/` are automatically run
3. **Test data seeding**: The `supabase/seed.sql` file provides test data for E2E tests
4. **No production data**: Tests run against clean, isolated databases

### Files Involved

- `supabase/migrations/20250621003015_initial_schema.sql` - Trigger file for Supabase Branching
- `supabase/seed.sql` - Test data automatically loaded into preview databases
- `scripts/setup-supabase-staging.js` - Local development setup script
- `scripts/seed-e2e-data.js` - Local test data seeding (backup method)

### Local Development

```bash
# Setup local Supabase for testing
yarn supabase:setup

# Start local Supabase
yarn supabase:start

# Reset local database
yarn supabase:reset

# Run E2E tests
yarn test:e2e
```

### E2E Test Data

The seed data includes:

- Test users including `nickoferrall+new@gmail.com` for E2E tests
- "Hells Bells CrossFit Competition" that E2E tests search for
- Test categories and ticket types for registration flows
- Partner matching test data

### Benefits

✅ **Isolated testing** - Each PR gets its own database  
✅ **No production pollution** - Tests never touch real data  
✅ **Automatic setup** - Migrations and seeding happen automatically  
✅ **Fast feedback** - Preview databases are ready when PR is created  
✅ **Easy cleanup** - Preview databases are automatically deleted when PR is merged/closed

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Run migrations
yarn migrate

# Generate GraphQL types
yarn generate
```
