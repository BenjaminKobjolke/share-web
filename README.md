# Share Web

A Svelte 5 single-page application for managing shared text and file entries. Connects to the [media-file-explorer-share-api](https://github.com/BenjaminKobjolke/media-file-explorer-share-api) PHP backend.

## Features

- Browse, search, and paginate entries
- View entry details with file previews (images, text, video, audio, PDF)
- Upload text/URLs or files with optional project tagging and email notifications
- Edit entry metadata and append attachments
- Settings hub with configurable default values for uploads
- System-aware dark mode (follows OS light/dark preference)
- HTTP Basic Auth and anonymous access support

## Tech Stack

- **Svelte 5** with runes (`$state`, `$derived`, `$props`)
- **Vite 6** for development and production builds
- **Tailwind CSS 3** with `darkMode: 'media'`
- **svelte-spa-router** for hash-based client-side routing

## Prerequisites

- Node.js (LTS recommended)
- The [media-file-explorer-share-api](https://github.com/BenjaminKobjolke/media-file-explorer-share-api) backend running

## Setup

```bash
npm install
```

Copy the environment file and adjust if needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Base URL for API requests |

## Development

```bash
npm run dev
```

The dev server proxies `/api/*` and `/share.php` requests to `http://localhost/media-file-explorer-share-api`.

## Production Build

```bash
npm run build
```

Output goes to `dist/`. The build uses relative paths (`base: './'`) so it can be served from any subdirectory.

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
  components/
    detail/          # Entry detail view components
    entries/         # Entry list, table, pagination, search
    layout/          # Navbar
    shared/          # Toast, ConfirmDialog, LoadingSpinner
    upload/          # Text and file upload forms
  lib/
    api.js           # API client (fetch wrapper with Basic Auth)
    auth.js          # Auth helpers (sessionStorage)
    utils.js         # Date formatting, file size, truncation
  routes/
    EntryDetail.svelte
    EntryList.svelte
    Login.svelte
    Settings.svelte              # Settings hub page
    SettingsBuiltInValues.svelte # Default project & email settings
    Upload.svelte
  stores/
    auth.js          # Auth state (sessionStorage)
    notifications.js # Toast notifications
    settings.js      # User preferences (localStorage)
  App.svelte         # Router and layout
  config.js          # API base URL config
  main.js            # Entry point
hooks/               # Claude Code validation hooks
hoppscotch/          # API collection for Hoppscotch
tools/               # install.bat, run.bat, build.bat
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login form |
| `/` | Entry list (authenticated) |
| `/entries/:id` | Entry detail (authenticated) |
| `/upload` | Add text or file (authenticated) |
| `/settings` | Settings hub (authenticated) |
| `/settings/built-in-values` | Default project and email preferences |

## Authentication

The app checks the backend's auth method on startup. If the API requires no authentication, anonymous access is used automatically. Otherwise, users log in with username/password (HTTP Basic Auth). Credentials are stored in `sessionStorage` and cleared on logout or 401 responses.

## Dark Mode

Dark mode follows the operating system preference via Tailwind's `darkMode: 'media'`. No manual toggle is needed — switch your OS to dark mode and the UI adapts automatically.
