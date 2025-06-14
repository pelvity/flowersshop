const fs = require('fs');
const path = require('path');

// Define paths
const i18nDir = path.resolve(__dirname, '../i18n');
const messagesDir = path.resolve(__dirname, '../messages');

async function generateJsonFiles() {
  try {
    // Ensure the messages directory exists
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true });
    }

    // Read all files from the i18n directory
    const files = fs.readdirSync(i18nDir);

    for (const file of files) {
      if (file.endsWith('.ts') && file !== 'schema.ts') {
        const lang = path.basename(file, '.ts');
        const modulePath = path.join(i18nDir, file);
        
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const languageModule = require(modulePath);
        const translations = languageModule[lang];

        if (translations) {
          const jsonContent = JSON.stringify(translations, null, 2);
          const outputPath = path.join(messagesDir, `${lang}.json`);
          fs.writeFileSync(outputPath, jsonContent, 'utf-8');
          console.log(`Successfully generated ${outputPath}`);
        }
      }
    }
  } catch (error) {
    console.error('Error generating i18n JSON files:', error);
    process.exit(1);
  }
}

generateJsonFiles(); 