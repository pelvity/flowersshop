// Script to generate a SQL schema from TypeScript type definitions
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Path to the TypeScript type definitions
const typesFilePath = path.resolve(__dirname, '../src/types/supabase.ts');
const schemaDir = path.resolve(__dirname, '../supabase');
const schemaFilePath = path.resolve(schemaDir, 'schema.sql');

// Ensure the supabase directory exists
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

// Function to extract table structure from TypeScript types
function generateSchemaFromTypes() {
  console.log('Generating schema from TypeScript types...');

  // Read the TypeScript file
  const fileContent = fs.readFileSync(typesFilePath, 'utf8');

  // Extract table information
  const tablesData = parseTablesFromTypeScript(fileContent);

  // Generate SQL schema
  const sqlSchema = generateSQLSchema(tablesData);

  // Write to schema.sql file
  fs.writeFileSync(schemaFilePath, sqlSchema);

  console.log(`Schema successfully generated at ${schemaFilePath}`);
}

// Parse TypeScript types to extract table information
function parseTablesFromTypeScript(content) {
  const tables = {};
  const tableRegex = /([a-zA-Z_]+):\s*{\s*Row:\s*{([^}]*)}/g;
  const columnRegex = /([a-zA-Z_]+):\s*([^;]+);/g;

  let tableMatch;
  while ((tableMatch = tableRegex.exec(content)) !== null) {
    const tableName = tableMatch[1];
    const columnsContent = tableMatch[2];

    const columns = [];
    let columnMatch;
    while ((columnMatch = columnRegex.exec(columnsContent)) !== null) {
      const columnName = columnMatch[1];
      let columnType = columnMatch[2].trim();

      // Convert TypeScript types to PostgreSQL types
      let sqlType;
      let nullable = columnType.includes('null');

      if (columnType.includes('string')) {
        sqlType = 'TEXT';
      } else if (columnType.includes('number')) {
        sqlType = 'NUMERIC';
      } else if (columnType.includes('boolean')) {
        sqlType = 'BOOLEAN';
      } else if (columnType.includes('string[]')) {
        sqlType = 'TEXT[]';
      } else if (columnType.includes('Date')) {
        sqlType = 'TIMESTAMP WITH TIME ZONE';
      } else {
        sqlType = 'TEXT'; // Default to TEXT for unknown types
      }

      columns.push({
        name: columnName,
        type: sqlType,
        nullable: nullable
      });
    }

    tables[tableName] = columns;
  }

  return tables;
}

// Generate SQL schema from the parsed table information
function generateSQLSchema(tablesData) {
  let sql = '-- Generated SQL Schema based on TypeScript types\n';
  sql += '-- Generated on: ' + new Date().toISOString() + '\n\n';

  for (const [tableName, columns] of Object.entries(tablesData)) {
    sql += `-- Table: ${tableName}\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

    const columnDefinitions = columns.map(col => {
      return `  ${col.name} ${col.type}${col.nullable ? '' : ' NOT NULL'}`;
    });

    sql += columnDefinitions.join(',\n');

    // Add primary key constraint for id column if it exists
    if (columns.find(col => col.name === 'id')) {
      sql += ',\n  PRIMARY KEY (id)';
    }

    sql += '\n);\n\n';

    // Add comment for table
    sql += `COMMENT ON TABLE public.${tableName} IS 'Table for ${tableName}';\n\n`;
  }

  return sql;
}

// Run the script
generateSchemaFromTypes();
