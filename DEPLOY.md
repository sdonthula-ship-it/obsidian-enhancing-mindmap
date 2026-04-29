# Quick Deploy Guide

## Setup (First Time Only)

```bash
# Install dependencies (if not already done)
npm install
```

## Deploy Workflow

### Option 1: Quick Deploy (Recommended)
```bash
npm run deploy
```
This will:
1. ✅ Build the plugin (`npm run build`)
2. ✅ Copy files to Obsidian plugin directory
3. ✅ Show success message

### Option 2: Direct Script
```bash
./deploy.sh
```

### Option 3: Manual Deploy
```bash
npm run build
cp main.js manifest.json styles.css "/Users/sdonthula/Library/CloudStorage/GoogleDrive-sumanth.d07@gmail.com/My Drive/Work/Work/.obsidian/plugins/obsidian-enhancing-mindmap/"
```

## Testing Changes

After deploying:
1. Go to Obsidian
2. Press **Cmd+R** (or Ctrl+R on Windows/Linux) to reload
3. Your changes should now be active!

## Development Mode

For active development with auto-rebuild:
```bash
npm run dev
```
Then manually copy files or run `./deploy.sh` in another terminal when you want to test.

## Plugin Location

**Source Code:**
```
/Users/sdonthula/code/obsidian_plugins/obsidian-enhancing-mindmap
```

**Installed Plugin:**
```
/Users/sdonthula/Library/CloudStorage/GoogleDrive-sumanth.d07@gmail.com/My Drive/Work/Work/.obsidian/plugins/obsidian-enhancing-mindmap
```

## Files Deployed

- `main.js` - Compiled plugin code
- `manifest.json` - Plugin metadata
- `styles.css` - Plugin styles
