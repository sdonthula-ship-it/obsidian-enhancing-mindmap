# Node Overlap Fix + Connection Limitations

## ✅ Problem Fixed: Overlapping Nodes

When creating multiple nodes with `Ctrl/Cmd+Enter` at the same cursor position, they were all stacking on top of each other.

## Solution: Smart Collision Detection

Nodes now use **actual collision detection** to find empty positions:

### Algorithm
1. **Check collision** - Tests if requested position overlaps any existing node
2. **Find empty space** - If occupied, searches up to 20 nearby positions
3. **Large spacing** - 300px horizontal, 200px vertical gaps
4. **Bounding box detection** - Checks actual node dimensions with 80px padding

### Spacing Configuration
- **Horizontal spacing:** 300px (was 180px)
- **Vertical spacing:** 200px (was 120px)
- **Collision padding:** 80px safety margin
- **Search attempts:** 20 positions before fallback

**How it works:**
- Click anywhere and press `Ctrl/Cmd+Enter`
- System checks if position is empty
- If occupied, automatically finds nearest empty spot
- Node appears with no overlap guaranteed
- Works for both instant capture and floating node creation

## Important: Connection Limitations

### Current Architecture
The plugin currently uses a **tree structure**, meaning:
- ✓ Each node can have ONE parent
- ✓ Each node can have MULTIPLE children
- ✗ Nodes CANNOT have multiple parents (no arbitrary connections)

### What You CAN Do
1. **Create parent-child relationships:**
   - Select a node
   - Press `Tab` to add child
   - Press `Enter` to add sibling

2. **Reparent nodes (change parent):**
   - Hold `Alt` while dragging a node
   - Drop it on a different parent
   - This changes its parent-child relationship

3. **Free positioning (no connection change):**
   - Select a node (click once - red border)
   - Drag normally (without Alt)
   - Node moves but keeps same parent

### What You CANNOT Do (Yet)
- ✗ Connect two arbitrary floating nodes
- ✗ Create nodes with multiple parents
- ✗ Draw custom connection lines between any two nodes
- ✗ Create graph-like many-to-many relationships

### Future: Many-to-Many Connections

From the ROADMAP.md:

> **Phase 1.1: Data Model Refactor (Week 1)**
>
> Transform from tree structure to graph structure:
> - Nodes can have multiple connections
> - Connection types: parent-child, reference, related, custom
> - Visual connection creation (drag from edge to edge)
> - Estimated effort: 3-5 days

This is the #1 priority architectural change needed to support the full vision.

## Testing the Fix

1. **Reload Obsidian:** Press `Cmd+R`

2. **Test auto-spacing:**
   - Move cursor to a spot on canvas
   - Press `Ctrl/Cmd+Enter` multiple times quickly
   - Nodes should appear in a grid pattern, not overlapping

3. **Test different areas:**
   - Move cursor to a different spot (far away)
   - Press `Ctrl/Cmd+Enter` again
   - New grid should start at that new position

4. **Current workflow for connections:**
   - Create a root node
   - Select it
   - Press `Tab` to add children
   - Press `Enter` to add siblings
   - Use `Alt+drag` to reparent nodes if needed

---

**Status:** ✅ Node spacing fixed, tree structure limitation documented
