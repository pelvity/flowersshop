// Script to generate a SQL schema based on the project's database structure
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('Generating local database schema from project structure...');

// Path to the output schema file
const schemaDir = path.resolve(__dirname, '../supabase');
const schemaFilePath = path.resolve(schemaDir, 'schema.sql');

// Ensure the supabase directory exists
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

// Read the TypeScript types file to extract database structure
const typesFilePath = path.resolve(__dirname, '../src/types/supabase.ts');
const typesContent = fs.readFileSync(typesFilePath, 'utf8');

// Generate SQL schema based on extracted information
function generateSchema() {
  let sql = '-- Supabase database schema\n';
  sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';

  // Add extension statements
  sql += '-- Enable required extensions\n';
  sql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n';
  sql += 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n\n';

  // Create schemas
  sql += '-- Create schemas\n';
  sql += 'CREATE SCHEMA IF NOT EXISTS public;\n\n';

  // Extract tables from TypeScript types
  const tableMatches = [...typesContent.matchAll(/([a-zA-Z_]+):\s*{\s*Row:\s*{([^}]*)}/g)];

  // Process each table
  for (const match of tableMatches) {
    const tableName = match[1];
    const columnsContent = match[2];

    sql += `-- Table: ${tableName}\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

    // Extract columns from the table definition
    const columnMatches = [...columnsContent.matchAll(/([a-zA-Z_]+):\s*([^;]+);/g)];
    const columns = [];

    for (const colMatch of columnMatches) {
      const columnName = colMatch[1];
      let columnType = colMatch[2].trim();

      // Convert TypeScript types to PostgreSQL types
      let sqlType;
      let nullable = columnType.includes('null');
      let isPrimaryKey = columnName === 'id';

      if (columnName === 'id') {
        sqlType = 'UUID';
      } else if (columnType.includes('string')) {
        sqlType = 'TEXT';
      } else if (columnType.includes('number')) {
        sqlType = 'NUMERIC';
      } else if (columnType.includes('boolean')) {
        sqlType = 'BOOLEAN';
      } else if (columnType.includes('string[]')) {
        sqlType = 'TEXT[]';
      } else if (columnType.includes('Date') || columnType.includes('date')) {
        sqlType = 'TIMESTAMP WITH TIME ZONE';
      } else {
        sqlType = 'TEXT'; // Default to TEXT for unknown types
      }

      columns.push({
        name: columnName,
        type: sqlType,
        nullable: nullable,
        isPrimaryKey: isPrimaryKey
      });
    }

    // Build column definitions
    const columnDefinitions = columns.map(col => {
      let def = `  ${col.name} ${col.type}`;

      if (col.isPrimaryKey) {
        def += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
      } else if (!col.nullable) {
        def += ' NOT NULL';
      }

      return def;
    });

    sql += columnDefinitions.join(',\n');
    sql += '\n);\n\n';

    // Add table comment
    sql += `COMMENT ON TABLE public.${tableName} IS 'Table for ${tableName}';\n\n`;

    // Add timestamps triggers if created_at and updated_at exist
    if (columns.some(col => col.name === 'created_at') && 
        columns.some(col => col.name === 'updated_at')) {
      sql += `-- Add timestamps trigger for ${tableName}\n`;
      sql += `CREATE OR REPLACE FUNCTION public.handle_${tableName}_timestamps()\n`;
      sql += `RETURNS TRIGGER AS $$\n`;
      sql += `BEGIN\n`;
      sql += `  NEW.updated_at = NOW();\n`;
      sql += `  IF TG_OP = 'INSERT' THEN\n`;
      sql += `    NEW.created_at = NOW();\n`;
      sql += `  END IF;\n`;
      sql += `  RETURN NEW;\n`;
      sql += `END;\n`;
      sql += `$$ LANGUAGE plpgsql;\n\n`;

      sql += `DROP TRIGGER IF EXISTS ${tableName}_timestamps_trigger ON public.${tableName};\n`;
      sql += `CREATE TRIGGER ${tableName}_timestamps_trigger\n`;
      sql += `BEFORE INSERT OR UPDATE ON public.${tableName}\n`;
      sql += `FOR EACH ROW EXECUTE PROCEDURE public.handle_${tableName}_timestamps();\n\n`;
    }
  }

  // Add reference constraints based on naming conventions
  for (const match of tableMatches) {
    const tableName = match[1];
    const columnsContent = match[2];

    // Look for potential foreign keys (columns ending with _id)
    const foreignKeyMatches = [...columnsContent.matchAll(/([a-zA-Z_]+_id):\s*([^;]+);/g)];

    for (const fkMatch of foreignKeyMatches) {
      const columnName = fkMatch[1];
      // Skip 'id' column itself
      if (columnName === 'id') continue;

      // Extract the referenced table name (remove _id suffix)
      const referencedTable = columnName.replace(/_id$/, '');

      // Only add if the referenced table seems to exist (based on table matches)
      if (tableMatches.some(m => m[1] === referencedTable || m[1] === referencedTable + 's')) {
        const targetTable = tableMatches.some(m => m[1] === referencedTable) ? 
          referencedTable : referencedTable + 's';

        sql += `-- Add foreign key constraint for ${tableName}.${columnName}\n`;
        sql += `ALTER TABLE public.${tableName} \n`;
        sql += `  ADD CONSTRAINT fk_${tableName}_${columnName} \n`;
        sql += `  FOREIGN KEY (${columnName}) \n`;
        sql += `  REFERENCES public.${targetTable}(id) \n`;
        sql += `  ON DELETE CASCADE;\n\n`;
      }
    }
  }

  // Add RLS policies
  sql += '-- Row Level Security Policies\n';
  sql += '-- Uncomment and modify these templates as needed\n';

  for (const match of tableMatches) {
    const tableName = match[1];

    sql += `-- Enable RLS on ${tableName}\n`;
    sql += `-- ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

    sql += `-- Create policies for ${tableName}\n`;
    sql += `-- CREATE POLICY "Allow public read for ${tableName}" ON public.${tableName} FOR SELECT USING (true);\n`;
    sql += `-- CREATE POLICY "Allow authenticated insert for ${tableName}" ON public.${tableName} FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);\n`;
    sql += `-- CREATE POLICY "Allow individual update for ${tableName}" ON public.${tableName} FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);\n\n`;
  }

  return sql;
}

// Generate and write the schema
const sqlSchema = generateSchema();
fs.writeFileSync(schemaFilePath, sqlSchema);

console.log(`Schema successfully generated at ${schemaFilePath}`);
