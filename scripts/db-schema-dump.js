// Script to dump the full Supabase database schema
require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get Supabase URL and key from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

const projectDir = path.resolve(__dirname, '..');
const schemaDir = path.join(projectDir, 'supabase');
const schemaFile = path.join(schemaDir, 'schema.sql');

// Ensure the supabase directory exists
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

console.log('Dumping Supabase database schema...');

try {
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: Supabase CLI not found. Please install it with: npm install -g supabase');
    process.exit(1);
  }

  // Get database schema using Supabase CLI
  execSync(
    `supabase db dump --db-url "${SUPABASE_URL.replace('https://', 'postgresql://postgres:')}"\
      ${SUPABASE_SERVICE_KEY}@${SUPABASE_URL.replace('https://', '')}/postgres"\
      -f "${schemaFile}"`,
    { stdio: 'inherit' }
  );

  console.log(`Database schema successfully saved to ${schemaFile}`);
} catch (error) {
  console.error('Error dumping database schema:', error.message);
  console.log('Trying alternative approach with pg_dump...');

  try {
    // Alternative approach using direct pg_dump
    const pgDumpCommand = `pg_dump --schema-only \
      --no-owner --no-privileges \
      --dbname="postgresql://postgres:${SUPABASE_SERVICE_KEY}@${SUPABASE_URL.replace('https://', '').replace('.supabase.co', '-db.supabase.co:5432')}/postgres" \
      > "${schemaFile}"`;

    execSync(pgDumpCommand, { stdio: 'inherit', shell: true });
    console.log(`Database schema successfully saved to ${schemaFile}`);
  } catch (pgError) {
    console.error('Error with pg_dump approach:', pgError.message);
    console.log('\nAlternative manual approach:');
    console.log('1. Install Supabase CLI: npm install -g supabase');
    console.log('2. Run: supabase login');
    console.log(`3. Run: supabase db dump -p ${SUPABASE_URL.split('//')[1].split('.')[0]} > ${schemaFile}`);
  }
}
