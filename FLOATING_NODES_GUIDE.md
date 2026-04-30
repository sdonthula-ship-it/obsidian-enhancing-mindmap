# Floating Nodes Guide

## Overview

All nodes in the mindmap can now be freely positioned anywhere on the canvas! You can move nodes without changing their parent-child relationships, giving you complete control over the visual layout while maintaining the logical structure.

## Key Features

### 1. Free Positioning (Default Drag)

**All nodes are freely movable by default**. Just click and drag any node to position it anywhere on the canvas.

**How it works:**
- **Click and drag** any node → Moves it to a new position
- The node's position is saved as a "floating" position
- The position persists across sessions
- Layout algorithm respects floating positions

**Visual feedback:**
- Node becomes semi-transparent while dragging
- Smooth repositioning in real-time
- Position is saved automatically on drop

### 2. Reparenting Mode (Alt+Drag)

To change parent-child relationships (move nodes in the hierarchy), use **Alt+Drag** or **Cmd+Drag**.

**How it works:**
- **Alt+Drag** (or Cmd+Drag) → Shows drop targets and arrows
- Drop on a node to reparent
- Drop zones: top/bottom for siblings, center/edges for children
- **Ctrl+Alt+Drag** → Copy instead of move

**Visual feedback:**
- Pulsing outlines on valid drop targets
- Arrow indicators showing where node will go
- Different colors for different drop types

### 3. Quick Add Floating Node

Create standalone nodes quickly with a keyboard shortcut!

**Keyboard Shortcut:** `Alt + Shift + F`

**How it works:**
1. Press `Alt + Shift + F`
2. Enter node text in the prompt
3. Node appears at viewport center
4. Node is independent (no parent initially)
5. You can later connect it or leave it floating

**Use cases:**
- Quick capture of ideas
- Create annotation nodes
- Add labels or markers
- Build non-hierarchical structures

## Usage Guide

### Moving Nodes Freely

**To reposition any node:**
1. **Click and drag** the node
2. Move it anywhere on the canvas
3. **Release** to drop at new position
4. Position is automatically saved

**Example:**
```
Before:
  Root
  ├─ Child 1
  └─ Child 2

After moving Child 1:
  Root ──────────────────┐
  └─ Child 2             │
                    Child 1 (floating)
```

The logical structure remains the same, but visual position is custom.

### Reparenting Nodes

**To change parent-child relationships:**
1. **Hold Alt** (or Cmd) and **click** the node
2. **Drag** toward target parent
3. Watch for drop indicators (arrows)
4. **Release** to reparent

**Example:**
```
Before (Alt+drag Child 1 to Child 2):
  Root
  ├─ Child 1
  └─ Child 2

After:
  Root
  └─ Child 2
      └─ Child 1 (now child of Child 2)
```

### Creating Floating Nodes

**Method 1: Quick Add (Keyboard Shortcut)**
1. Press `Alt + Shift + F`
2. Type node text
3. Press Enter
4. Node appears at center of viewport

**Method 2: Move Existing Node**
1. Drag any node to desired position
2. It becomes floating automatically

**Method 3: Add Root Node**
1. Press `Alt + Shift + N` to add new root
2. Drag root node to custom position

### Connecting Floating Nodes

To connect a floating node to the hierarchy:
1. **Alt+Drag** the floating node
2. Drop it on a parent node
3. It becomes a child in that part of the tree

Or to make any node floating again:
1. Simply **drag it** to a new position
2. It keeps its hierarchical relationship but custom position

## Drag Modes Summary

| Mode | Keys | Behavior | Visual Feedback |
|------|------|----------|-----------------|
| **Position Mode** | Click + Drag | Move node freely | Semi-transparent, real-time movement |
| **Reparent Mode** | Alt/Cmd + Drag | Change parent-child relationship | Drop targets, arrows |
| **Copy Mode** | Ctrl + Alt + Drag | Copy node to new parent | Drop targets + "copy" notice |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Quick add floating node** | Alt + Shift + F |
| **Add new root node** | Alt + Shift + N |
| **Reparent drag** | Hold Alt/Cmd while dragging |
| **Copy drag** | Hold Ctrl + Alt while dragging |

## Technical Details

### Data Structure

Floating nodes have these properties:
```typescript
{
  isFloating: true,      // Marks node as having custom position
  floatingX: 1234,       // Custom X coordinate
  floatingY: 5678        // Custom Y coordinate
}
```

### Position Persistence

- Floating positions are saved in node data
- Positions persist across sessions
- Layout algorithm runs first, then floating positions override
- Method: `restoreFloatingPositions()` in mindmap.ts

### How It Works

1. **Normal layout**: Layout algorithm calculates positions for all nodes
2. **Override**: Floating nodes override with custom positions
3. **Save**: On drag end, position saved to `floatingX`, `floatingY`
4. **Restore**: On refresh, `restoreFloatingPositions()` applies custom positions

## Use Cases

### 1. Custom Layouts

Create your own visual arrangements while keeping logical structure:
```
  Root (center)
    ↓
  Important Branch (left)    Less Important (right, smaller)
    ↓                          ↓
  Details (below)           Notes (far right)
```

### 2. Spatial Organization

Position nodes spatially for better comprehension:
```
Past (left) ─── Present (center) ─── Future (right)
     ↓               ↓                    ↓
   Old Ideas    Current Work         Upcoming
```

### 3. Floating Annotations

Add standalone notes that don't fit the hierarchy:
```
  Main Topic
  ├─ Subtopic 1
  └─ Subtopic 2

  "Remember to review this!" (floating annotation)
```

### 4. Non-Hierarchical Connections

Create networks of ideas with custom positioning:
```
   Concept A ──────┐
       ↓           ↓
   Concept B → Concept C
       ↓           ↑
   Concept D ──────┘
```

## Tips and Tricks

### Organization

1. **Start with tree layout** - Let the algorithm position nodes initially
2. **Adjust key nodes** - Move important nodes to prominent positions
3. **Floating annotations** - Use Alt+Shift+F for quick notes
4. **Root positioning** - Drag root nodes to organize multiple maps

### Workflow

1. **Build content first** - Focus on structure before positioning
2. **Position for presentation** - Adjust layout when ready to share
3. **Use both modes** - Normal drag for position, Alt+drag for hierarchy
4. **Quick capture** - Alt+Shift+F for rapid idea collection

### Visual Hierarchy

1. **Important nodes left** - Visual convention for primary info
2. **Supporting nodes right** - Secondary details to the side
3. **Annotations floating** - Notes and labels unconnected
4. **Temporal left-to-right** - Past → Present → Future

## Limitations and Notes

### Current Limitations

1. **Floating root nodes** - Root positions are floating by default but still in roots array
2. **No visual connections yet** - Can't draw custom lines between floating nodes (planned)
3. **Markdown export** - Floating positions not preserved in markdown (visual layer only)

### Important Notes

- **Floating is visual only** - Hierarchical relationships unchanged unless you Alt+drag
- **All nodes draggable** - No need to select first, just drag
- **Persistence** - Positions saved in node data, persist across sessions
- **Layout refresh** - Floating positions override layout calculations

## Troubleshooting

**Q: Node snapped back after I moved it**
A: You might have pressed Alt during drag (reparent mode). Try again without Alt.

**Q: Node disappeared after moving**
A: It might be off-screen. Press Alt+E to center on selected node, or zoom out.

**Q: Can't move root node**
A: Root nodes are always floating. Just drag them normally (no Alt needed).

**Q: Moved node but hierarchy changed**
A: You used Alt+drag (reparent mode). Use normal drag for position-only moves.

**Q: How to reset to automatic layout?**
A: Currently no "reset position" feature. You can manually drag back or reload the file (positions are saved per-session in memory, not all persist to markdown yet).

## Future Enhancements

- [ ] Visual connection lines between floating nodes
- [ ] "Reset position" command to return to auto-layout
- [ ] Floating node persistence in markdown format
- [ ] Grid snap and alignment tools
- [ ] Group selection and multi-node positioning
- [ ] Canvas zones and swimlanes

---

**Happy floating!** Position nodes anywhere, organize spatially, and create custom layouts that work for your thinking style.
