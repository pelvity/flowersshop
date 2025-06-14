# Database Schema Management

This project includes tools to manage and version the Supabase database schema as code. This allows for better tracking of database changes, collaboration, and simplifies development and deployment workflows.

## Available Scripts

The following npm scripts are available for managing the database schema:

### `npm run db:schema`

This script uses the Supabase CLI to dump the current schema from your remote Supabase database. It requires:

- Supabase CLI installed (`npm install -g supabase`)
- Valid `.env` file with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` 

The schema will be saved to `supabase/schema.sql`.

### `npm run db:schema:local`

If you don't have access to the Supabase CLI or want to generate a schema based on your TypeScript types, use this script. It analyzes the `src/types/supabase.ts` file and generates a schema with tables, columns, and relationships.

This is useful for documenting your database structure or for creating a starting point for a new schema.

### `npm run db:schema:generate`

A simplified version of the local schema generator that creates a basic SQL schema from your TypeScript types.

## Best Practices for Database Changes

1. **Always version schema changes**: Keep your `schema.sql` file up to date with any database changes

2. **Generate schema after changes**: Run `npm run db:schema` after making changes to your database structure

3. **Review schema diffs**: Check the git diff of your schema file to understand the impact of changes

4. **Include schema changes in PRs**: When submitting PRs that affect the database, include the updated schema file

## How It Works

The schema file contains SQL statements that define your database structure including:

- Tables and columns
- Constraints and relationships
- Indexes
- Functions and triggers
- Policies for Row Level Security

This file serves as documentation and as a reference for the complete database structure.

## Using the Schema with AI Tools

Having your database schema in a SQL file makes it easy to share the structure with AI assistants when you need help with database-related tasks. You can point the AI to your `supabase/schema.sql` file to provide context about your database.
