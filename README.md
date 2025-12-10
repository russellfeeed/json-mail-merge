# JSON-CSV Merge Tool

A web-based tool for merging CSV data into JSON templates with powerful placeholder substitution, transformations, and batch processing capabilities.

## Overview

The JSON-CSV Merge Tool allows you to create dynamic JSON outputs by combining CSV data with JSON templates. It's perfect for generating configuration files, API payloads, test data, or any structured JSON content from tabular data sources.

## Features

### Core Functionality
- **JSON Template Editor** - Write or paste JSON templates with syntax validation and placeholder highlighting
- **CSV Data Editor** - Import CSV files via drag-and-drop or paste directly, with tabular preview
- **Real-time Validation** - Instant feedback on JSON validity and missing CSV columns
- **Batch Processing** - Generate individual JSON files per CSV row or combine into a single array

### Placeholder System

| Type | Example | Description |
|------|---------|-------------|
| **CSV Column** | `{{name}}`, `{{email}}` | Replaced with values from CSV columns |
| **System** | `{{currentDatetime}}`, `{{uuid}}`, `{{timestamp}}` | Auto-generated dynamic values |
| **User Input** | `{{userInputString}}`, `{{userInputNumber}}` | Single value applied to all rows |
| **Row Input** | `{{rowInputString}}`, `{{rowInputNumber}}` | Unique value per row (must be inside arrays) |

### Placeholder Methods
Transform placeholder values with chainable methods:
```
{{name.toUpperCase()}}
{{email.slugify().toLowerCase()}}
{{title.titleCase()}}
```

Available methods: `toLowerCase`, `toUpperCase`, `trim`, `capitalize`, `titleCase`, `slugify`, `camelCase`, `snakeCase`, `reverse`, `length`

### Array Mode
Generate a single JSON file containing an array with one item per CSV row, instead of multiple separate files.

### Additional Features
- **Autocomplete** - Suggestions appear when typing `{{` for quick placeholder insertion
- **Preset Templates** - Quick-start with predefined JSON structures
- **Download Options** - Export individual results or all as a combined JSON array
- **Sample Data** - Load example templates and CSV data to explore features
- **Interactive Tour** - Guided walkthrough for first-time users
- **Fixed Timestamps** - Lock date/time placeholders to specific values for deterministic output

---

## Development

### Tech Stack
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

### Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

---

## Adding New JSON Templates

To add a new preset JSON template, edit the `presetTemplates` array in `src/components/JsonEditor.tsx`:

```typescript
const presetTemplates = [
  {
    id: 'my-template',      // Unique identifier (kebab-case)
    name: 'My Template',    // Display name in dropdown
    content: `{
      "field": "{{placeholder}}",
      "timestamp": "{{currentDatetime}}",
      "items": [
        {
          "name": "{{name}}",
          "rowNote": "{{rowInputString}}"
        }
      ]
    }`
  },
  // ... other templates
];
```

---

## Deployment

### Lovable Publish
Open [Lovable](https://lovable.dev/projects/d030c1cb-9bed-443b-b8c4-facdd3dfed2a) and click Share → Publish.

### Self-Hosting (IIS, Apache, Nginx)

This is a static single-page application (SPA) that can be deployed to any web server.

#### 1. Build the Production Bundle

```sh
npm run build
```

This creates a `dist/` folder containing all static files.

#### 2. Deploy to IIS

1. Copy the contents of `dist/` to your IIS site folder
2. Create a `web.config` file in the site root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
```

3. Ensure the **URL Rewrite** module is installed in IIS

#### 3. Deploy to Apache

Create a `.htaccess` file in the site root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 4. Deploy to Nginx

Add this to your server block:

```nginx
location / {
  root /var/www/json-merge-tool;
  index index.html;
  try_files $uri $uri/ /index.html;
}
```

#### 5. Subfolder Deployment

If deploying to a subfolder (e.g., `/tools/json-merge/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/tools/json-merge/',
  // ... rest of config
})
```

Then rebuild and update the rewrite rules to match your base path.

---

## Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains in Lovable and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
