# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin that enables editing interactive mind maps directly from markdown files. Files with the frontmatter key `mindmap-plugin: basic` are automatically rendered as visual mind maps with full editing capabilities.

## Build Commands

```bash
# Development mode with watch
npm run dev

# Production build
npm run build

# Build and deploy to Obsidian plugin directory
npm run deploy
# or
./deploy.sh
```

The build outputs `main.js` to the project root. The deploy script automatically copies `main.js`, `manifest.json`, and `styles.css` to the Obsidian plugin installation directory.

**See DEPLOY.md for detailed deployment instructions.**

## Architecture

### Plugin Entry Point
- `src/main.ts` - `MindMapPlugin` class that extends Obsidian's `Plugin`
  - Registers the custom view type (`mindmapView`)
  - Defines 50+ commands with keyboard shortcuts
  - Manages view mode switching between markdown and mindmap
  - Uses "monkey-around" to patch Obsidian's `WorkspaceLeaf` for view interception

### View Layer
- `src/MindMapView.ts` - `MindMapView` extends `TextFileView`
  - Renders the interactive mindmap canvas
  - Handles markdown ↔ mindmap data transformation
  - Manages export to PNG/JPEG/HTML
  - Syncs changes back to markdown file

### Core Mindmap Engine
- `src/mindmap/mindmap.ts` - `MindMap` class
  - SVG-based rendering using svg.js
  - Node manipulation (add, delete, move, edit)
  - Drag-and-drop node repositioning
  - Zoom and pan controls
  - Execute command pattern for undo/redo

### Command Pattern
- `src/mindmap/Execute.ts` - Command executor with history tracking
- `src/mindmap/History.ts` - Undo/redo stack implementation
- `src/mindmap/Cmds.ts` - Individual command implementations

### Node System
- `src/mindmap/INode.ts` - Node interface and data structure
  - Hierarchical tree structure
  - Expand/collapse state
  - Node positioning and dimensions
  - Text editing with inline markdown support

### Layout Engine
- `src/mindmap/Layout.ts` - Calculates node positions for mind map layout

### Markdown Transformation
- Uses markmap library (`src/markmapLib/`) for parsing markdown into tree structure
- Frontmatter with block IDs (`^id`) preserves collapse state

### Settings
- `src/settings.ts` - `MindMapSettings` class defines available options
- `src/settingTab.ts` - Settings UI in Obsidian preferences
- Settings: canvas size, font size, theme, layout direction, stroke colors

### Internationalization
- `src/lang/locale/` - Translation files for 20+ languages
- `src/lang/helpers.ts` - Translation helper function `t()`

## Key Concepts

### View Mode Detection
Files are opened in mindmap view when:
1. Frontmatter contains `mindmap-plugin: basic` (or other value)
2. User hasn't explicitly switched to markdown mode for that file
3. The plugin intercepts view state changes via monkey-patching

### Frontmatter Format
```markdown
---

mindmap-plugin: basic

---

# Root Node

## Child 1
## Child 2
```

### Node IDs for Collapse State
Nodes can have persistent IDs using caret syntax:
```markdown
## Collapsed Node ^abc123
```
This preserves expand/collapse state across saves.

### Command System
All node operations go through `mindmap.execute(commandName, params)` which:
1. Creates a command object
2. Executes it
3. Adds to history for undo/redo

Common commands: `addChildNode`, `addSiblingNode`, `deleteNodeAndChild`, `changeNodeText`, `moveNode`

### Keyboard Shortcuts
The plugin defines extensive keyboard shortcuts (see `src/main.ts` lines 29-1192):
- Tab: Add child node
- Enter: Add sibling node
- Delete: Delete node
- Space/F2: Edit node
- Arrow keys: Navigate
- Alt+Shift+Arrow: Move nodes
- Alt+E: Center view
- Alt+=/−: Zoom

## Development Notes

### Testing Changes
1. Make your code changes
2. Run `npm run deploy` to build and copy files to Obsidian plugin directory
3. Reload Obsidian (Cmd+R in developer mode)
4. Test with a markdown file containing `mindmap-plugin: basic` frontmatter

**Development Workflow:**
- Use `npm run dev` for watch mode during active development
- Use `npm run deploy` for quick build + deploy + test cycle

### Modifying Commands
- Add new commands in `src/main.ts` using `this.addCommand()`
- Implement command logic in `src/mindmap/Cmds.ts` if using undo/redo
- Otherwise, directly manipulate nodes in the command callback

### Changing Rendering
- Core rendering logic is in `src/mindmap/mindmap.ts`
- Uses SVG.js for drawing nodes and edges
- Call `mindmap.refresh()` to redraw after changes

### Adding Settings
1. Add property to `MindMapSettings` in `src/settings.ts`
2. Add UI control in `src/settingTab.ts`
3. Access via `this.plugin.settings.yourSetting` in views

### Working with Nodes
```typescript
// Access selected node
const node = mindmap.selectNode;

// Traverse tree
mindmap.traverseDF((node) => { /* callback */ });

// Node manipulation
node.setText(text);
node.expand() / node.collapse();
node.edit();
node.select();
```

## File Detection
Files with `mindmap-plugin` key in frontmatter are automatically opened in mindmap view unless the user has explicitly chosen markdown mode for that specific file instance.

## Recent Improvements

See `IMPROVEMENTS.md` for detailed documentation of recent visual and UX enhancements including:
- Modern glassmorphism design with shadows and blur effects
- Interactive connection lines with hover highlighting
- Smooth animations and transitions throughout
- Enhanced edit mode with better UX
- Depth-based visual hierarchy
- Comprehensive theme support
- Custom scrollbar styling

### Drag & Drop

See `DRAG_DROP_GUIDE.md` for complete guide. Quick overview:
- **Select-then-drag pattern** - Click to select node (red border), then drag to move
- **Mouse-based implementation** - Uses mousedown/mousemove/mouseup (not HTML5 drag API)
- **Visual feedback** - grab cursor, semi-transparent drag, pulsing drop targets
- **Drop zones** - top/bottom for siblings, center/edges for children
- **Copy mode** - Hold Ctrl/Cmd while dragging to copy instead of move
- **Implementation**: `appMouseDown`, `appMouseMove`, `appMouseUp` in mindmap.ts

### Multi-Root Support (Multi-Map Canvas)

See `MULTI_MAP_GUIDE.md` for complete guide. Quick overview:
- **Multiple root nodes** - Create separate independent maps on the same canvas
- **Keyboard shortcut**: Alt + Shift + N to add new root node
- **Root spacing** - Roots are positioned 800px apart horizontally
- **Collapse all** - Double-click an already-selected root to collapse/expand its entire tree
- **Data structure** - `mindmap.roots[]` array stores all root nodes, `mindmap.root` points to first root
- **Traversal** - `traverseDF` and `traverseBF` methods iterate over all roots when no node specified
- **Current limitation** - Only first root persists to markdown (multi-root markdown format TBD)

### Floating Nodes (Free Positioning)

See `FLOATING_NODES_GUIDE.md` for complete guide. Quick overview:
- **All nodes freely movable** - Click and drag any node to position it anywhere
- **Two drag modes**:
  - Normal drag: Free positioning (updates `floatingX`, `floatingY`)
  - Alt+drag: Reparenting (changes parent-child relationships)
- **Quick add**: Alt + Shift + F to create floating node from text prompt
- **Data structure**: Nodes with `isFloating: true` and custom `floatingX`, `floatingY` coordinates
- **Implementation**:
  - `appMouseDown` checks for Alt key to determine mode (`_isReparentDrag`)
  - `appMouseMove` either shows drop targets (reparent) or moves node position (free)
  - `appMouseUp` saves floating position or executes reparent operation
  - `restoreFloatingPositions()` overrides layout calculations with saved positions
- **Methods**: `addFloatingNode(text, x, y)` creates independent floating nodes
- **Position persistence**: Floating positions override layout algorithm after each refresh

### Graph Mode (Obsidian Graph View Style)

See `GRAPH_MODE_GUIDE.md` for complete guide. Quick overview:
- **Toggle**: Settings → Mind Map → "Graph Mode" toggle (global setting)
- **Visual style**: Circular nodes (like Obsidian Graph View) instead of rounded rectangles
- **Connection lines**: Straight lines instead of curved Bezier paths
- **Text labels**: Text appears below nodes (via CSS `::after` with `data-text` attribute)
- **Node sizes**:
  - Root: 24px circles
  - Second level: 20px circles
  - Regular: 16px circles
- **Implementation**:
  - Setting: `graphMode: boolean` in MindMapSettings
  - CSS: `.mm-graph-mode` class on `.mm-mindmap` element
  - Layout.ts: Checks `me.mind.setting.graphMode` to use `L` (line) instead of `C` (cubic Bezier) SVG paths
  - INode: `data-text` attribute updated on node creation and `setText()`
- **Use cases**: Network visualization, knowledge graphs, non-hierarchical brainstorming
- **Current limitation**: Global setting (affects all mindmaps), no physics simulation (manual positioning)
