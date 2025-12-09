# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d030c1cb-9bed-443b-b8c4-facdd3dfed2a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d030c1cb-9bed-443b-b8c4-facdd3dfed2a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

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

### Template Guidelines

- **id**: Use kebab-case, must be unique
- **name**: Human-readable name shown in the dropdown
- **content**: Valid JSON string with placeholders

### Available Placeholder Types

| Placeholder | Example | Description |
|------------|---------|-------------|
| CSV Column | `{{name}}` | Replaced with value from CSV column |
| System | `{{currentDatetime}}`, `{{uuid}}`, `{{timestamp}}` | Auto-generated values |
| User Input | `{{userInputString}}`, `{{userInputNumber}}` | Single value for all rows |
| Row Input | `{{rowInputString}}`, `{{rowInputNumber}}` | **Must be inside arrays** - unique value per row |

### Placeholder Methods

Placeholders support method chaining: `{{name.toUpperCase()}}`, `{{email.slugify().toLowerCase()}}`

Available methods: `toLowerCase`, `toUpperCase`, `trim`, `capitalize`, `titleCase`, `slugify`, `camelCase`, `snakeCase`, `reverse`, `length`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d030c1cb-9bed-443b-b8c4-facdd3dfed2a) and click on Share -> Publish.

## Self-Hosting Deployment (IIS, Apache, Nginx)

This is a static single-page application (SPA) that can be deployed to any web server.

### 1. Build the Production Bundle

```sh
npm run build
```

This creates a `dist/` folder containing all static files.

### 2. Deploy to IIS

1. Copy the contents of `dist/` to your IIS site folder (e.g., `C:\inetpub\wwwroot\json-merge-tool`)

2. Create a `web.config` file in the site root for SPA routing:

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

### 3. Deploy to Apache

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

### 4. Deploy to Nginx

Add this to your server block:

```nginx
location / {
  root /var/www/json-merge-tool;
  index index.html;
  try_files $uri $uri/ /index.html;
}
```

### 5. Subfolder Deployment

If deploying to a subfolder (e.g., `/tools/json-merge/`), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/tools/json-merge/',
  // ... rest of config
})
```

Then rebuild and update the rewrite rules to match your base path.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
