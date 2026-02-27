# Creating a New Release

## Version Management

### Check current version
```
tools\version.bat
```

### Increment patch version (e.g. 1.0.0 → 1.0.1)
```
tools\version-increment.bat
```

### Decrement patch version (e.g. 1.0.1 → 1.0.0)
```
tools\version-decrement.bat
```

## Release Notes

### Directory Structure
```
public/release_notes/
  manifest.json              ← auto-generated, lists all versions newest-first
  1.0.0/
    en.json                  ← release notes for v1.0.0
  1.0.1/
    en.json                  ← release notes for v1.0.1
```

### JSON Schema (`en.json`)
```json
{
  "version": "1.0.1",
  "date": "2026-03-01",
  "title": "Bug Fixes",
  "sections": [
    {
      "heading": "Bug Fixes",
      "items": [
        "Fixed issue with file upload validation",
        "Fixed dark mode toggle persistence"
      ]
    },
    {
      "heading": "Notes",
      "items": [
        "Only en.json is required — translations are not used"
      ]
    }
  ]
}
```

**Fields:**
- `version` — semver string (must match directory name)
- `date` — ISO date `YYYY-MM-DD`
- `title` — human-readable heading for this release
- `sections[]` — array of `{ heading, items[] }` (e.g. "Features", "Bug Fixes", "Notes")

### Regenerating the Manifest
The manifest is auto-generated during release, but can be regenerated manually:
```
node tools/update-manifest.js
```

## Building a Release

### Automated (recommended)
```
tools\release.bat
```

This will:
1. Increment the patch version
2. Check that release notes exist for the new version (creates placeholder if missing)
3. Regenerate `manifest.json`
4. Run `npm run build`
5. Output the `dist/` folder ready for deployment

### Manual Steps
1. Create release notes: `public/release_notes/<version>/en.json`
2. Increment version: `tools\version-increment.bat`
3. Update manifest: `node tools/update-manifest.js`
4. Build: `npm run build`

## In-App Release Notes

Release notes are viewable in the app at `#/about`, accessible from the Settings hub. The About page fetches the manifest at runtime and displays release notes with prev/next navigation.
