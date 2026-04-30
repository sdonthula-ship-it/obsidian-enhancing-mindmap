# Node Overlap Fix + Connection Limitations

## Problem Fixed: Overlapping Nodes

When creating multiple nodes with `Ctrl/Cmd+Enter` at the same cursor position, they were all stacking on top of each other.

## Solution: Auto-Spacing

Nodes created in the same area (within 50px) now automatically space themselves in a 3-column grid:

```
[Node 1]    [Node 2]    [Node 3]
[Node 4]    [Node 5]    [Node 6]
```

- **Horizontal spacing:** 180px between columns
- **Vertical spacing:** 120px between rows
- **Grid size:** 3 nodes per row

**How it works:**
- First node: appears at cursor position
- Subsequent nodes (if cursor hasn't moved much): automatically offset in grid pattern
- Move cursor to new area: grid resets to that new position

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
