# Multi-Map Canvas Guide

## Overview

The plugin now supports **multiple independent mind maps** on the same canvas! You can create separate "centers" (root nodes) and organize different topics side-by-side while still maintaining the ability to connect ideas between them.

## Key Features

### 1. Multiple Root Nodes (Independent Maps)

Instead of having just one root node per file, you can now have multiple root nodes on the same canvas. Each root node acts as a separate mind map center with its own hierarchy.

**Benefits:**
- Organize multiple related topics in one view
- Compare different approaches side-by-side
- Create modular knowledge structures
- Keep related but distinct ideas separate

### 2. Collapse All from Root

Clicking on an **already selected** root node collapses or expands its entire tree, giving you a clean overview and the ability to quickly minimize/maximize entire map sections.

### 3. Cross-Map Connections (Coming Soon)

While each root node maintains its own independent tree structure, you'll be able to create visual connections between nodes in different maps to show relationships across topics.

## How to Use

### Adding a New Root Node

**Keyboard Shortcut:** `Alt + Shift + N`

**Steps:**
1. Press `Alt + Shift + N` while in mindmap view
2. A new root node appears to the right of existing roots
3. The new root is automatically selected and centered
4. Edit it to give it a meaningful name

**Visual Result:**
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Original   │      │  New Map 1  │      │  New Map 2  │
│    Root     │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
      │                    │                    │
   (tree 1)             (tree 2)             (tree 3)
```

### Collapsing/Expanding Entire Maps

**Method:** Click on a root node twice (select it, then click again)

**Steps:**
1. **First click** - Selects the root node (red border appears)
2. **Second click** - Toggles collapse/expand for the entire tree under that root

**Behavior:**
- If any children are expanded → Collapses ALL descendants
- If all children are collapsed → Expands ALL descendants

**Use Cases:**
- Clean up your canvas by minimizing completed sections
- Focus on one map at a time
- Get a high-level overview of all your maps
- Prepare for presentations by collapsing details

### Moving Nodes Between Maps

You can drag and drop nodes from one map to another just like regular nodes!

**Example:** Move "Feature X" from "Product Ideas" map to "Q1 Roadmap" map

1. **Click** on "Feature X" to select it (red border)
2. **Drag** it over to the "Q1 Roadmap" root node
3. **Drop** where you want it:
   - On the root → becomes a child of that map's root
   - On another node → follows normal drop zone rules

## Layout and Spacing

### Root Node Positioning

- Roots are spaced **800px apart** horizontally
- All roots are at the same vertical level
- First root appears at the canvas center
- Additional roots extend to the right

### Navigation Tips

- Use **Alt + E** to center the view on the selected node
- Pan by clicking and dragging on empty canvas space
- Zoom with **Alt + +/-** or mouse wheel
- The canvas is large enough to hold many independent maps

## Markdown Representation

Currently, only the primary root node is saved to markdown. Multi-root support in markdown format is a future enhancement. For now:

- The first root node and its tree are saved
- Additional roots exist in the visual layer only
- Reloading the file will show only the primary root

**Future Enhancement:** Support for multiple markdown headings as separate roots, allowing full persistence of multi-map structures.

## Example Use Cases

### 1. Project Planning
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Phase 1    │    │   Phase 2    │    │   Phase 3    │
│   (Q1 2024)  │    │   (Q2 2024)  │    │   (Q3 2024)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 2. Learning Topics
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │    │   DevOps     │
│   Stack      │    │   Stack      │    │   Tools      │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 3. Comparison Matrix
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Option A   │    │   Option B   │    │   Option C   │
│   Pros/Cons  │    │   Pros/Cons  │    │   Pros/Cons  │
└──────────────┘    └──────────────┘    └──────────────┘
```

### 4. Multi-Topic Research
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Literature  │    │  Methodology │    │   Results    │
│    Review    │    │              │    │   Analysis   │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Tips and Tricks

### Organization

1. **Name your roots clearly** - Use descriptive names that instantly identify the map's purpose
2. **Keep related maps together** - The horizontal layout naturally groups related topics
3. **Use collapse strategically** - Minimize completed or less important maps to reduce visual clutter

### Workflow

1. **Start with one map** - Build out your main topic first
2. **Add new maps as needed** - When a topic becomes too large or distinct, split it off
3. **Collapse for overview** - Double-click roots to get a bird's-eye view of all topics
4. **Move freely** - Don't be afraid to reorganize nodes between maps as your thinking evolves

### Visual Management

1. **Zoom out** to see all maps at once (Alt + -)
2. **Center** on specific maps when working (Alt + E)
3. **Collapse all** root nodes for a clean status overview
4. **Expand only** the map you're actively working on

## Keyboard Shortcuts Summary

| Action | Shortcut |
|--------|----------|
| **Add new root node** | Alt + Shift + N |
| **Collapse/expand entire map** | Click selected root node |
| **Center view** | Alt + E |
| **Zoom in/out** | Alt + +/- |

## Known Limitations

1. **Markdown Persistence** - Only the first root saves to markdown currently
2. **Cross-map Links** - Visual connections between maps not yet implemented
3. **Root Positioning** - Roots are automatically positioned, manual positioning coming soon

## Future Enhancements

- [ ] Save all roots to markdown (multiple H1 headings)
- [ ] Visual connection lines between nodes in different maps
- [ ] Manual root positioning and rearrangement
- [ ] Root-level styling and colors
- [ ] Templates for common multi-map structures
- [ ] Export individual maps separately

## Troubleshooting

**Q: My new root disappeared after reloading**
A: Currently only the first root persists to markdown. This is a known limitation being addressed.

**Q: Can I connect nodes between different maps?**
A: You can move nodes between maps via drag-and-drop. Visual connection lines are planned for a future update.

**Q: How many root nodes can I create?**
A: Technically unlimited, but for practical use, 3-5 root nodes per canvas is recommended for clarity.

**Q: Can I delete a root node?**
A: Select the root and press Shift + Delete to remove it and all its children.

---

**Happy multi-mapping!** Create multiple perspectives, organize complex topics, and think in parallel with the new multi-map canvas feature.
