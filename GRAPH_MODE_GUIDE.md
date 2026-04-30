# Graph Mode Guide

## Overview

**Graph Mode** transforms your mindmap into a visual style similar to Obsidian's Graph View! Switch between traditional hierarchical Tree Mode and modern network-style Graph Mode with a single toggle.

## Key Differences

### Tree Mode (Default)
- **Nodes**: Rounded rectangles with text inside
- **Lines**: Curved Bezier paths
- **Layout**: Hierarchical tree structure
- **Style**: Rich styling with gradients and shadows

### Graph Mode
- **Nodes**: Circular dots (like Graph View)
- **Lines**: Straight connections
- **Labels**: Text appears below nodes
- **Style**: Minimalist, clean network visualization

## Visual Comparison

```
Tree Mode:                    Graph Mode:
┌─────────────┐                   ●
│   Parent    │              Parent
└──────┬──────┘                   │
   ┌───┴───┐                   ┌──┴──┐
┌──┴──┐ ┌──┴──┐                ●     ●
│Child│ │Child│              Child Child
└─────┘ └─────┘
```

## How to Enable

### Method 1: Settings (Persistent)

1. Open **Settings** → **Mind Map**
2. Find **"Graph Mode"** toggle
3. Enable it
4. All open mindmaps switch to Graph Mode
5. New mindmaps open in Graph Mode

### Method 2: Quick Toggle (Coming Soon)

- Keyboard shortcut to toggle mode per mindmap
- Currently use settings for global toggle

## Features in Graph Mode

### Circular Nodes

**Size indicates hierarchy:**
- **Root nodes**: Larger circles (24px) in accent color
- **Second level**: Medium circles (20px)
- **Other nodes**: Small circles (16px)

**Color coding:**
- Root: Accent color with glow
- Selected: Highlighted accent color
- Regular: Muted text color
- Hover: Slight fade effect

### Text Labels

- Appear **below** each node
- Auto-truncate long text (150px max width)
- Root node labels: 14px, bold
- Regular labels: 12px
- Ellipsis (...) for overflow

### Straight Connection Lines

- Simple straight lines between nodes
- Thinner than tree mode (1.5px default)
- Lower opacity (0.4) for cleaner look
- Hover: Brighten and thicken
- No curved Bezier calculations

### Simplified Interactions

- **No expand/collapse buttons** - All nodes always visible in graph mode
- **No drop indicators** - Just drag freely
- **Clean hover states** - Subtle opacity change
- **Direct connections** - Clearer parent-child relationships

## Drag and Drop in Graph Mode

### Position Mode (Default Drag)

Just like Tree Mode:
1. **Click and drag** any node
2. Node moves freely
3. Connections update in real-time
4. Position saved

### Reparent Mode (Alt+Drag)

1. **Hold Alt** (or Cmd)
2. **Drag** node to new parent
3. Connection lines reparent
4. Visual feedback minimal (no arrows)

## Use Cases

### Network Visualization

Perfect for showing interconnected concepts:
```
  Concept A ── Concept B
      │            │
  Concept C ── Concept D
      │            │
  Concept E ── Concept F
```

### Knowledge Graphs

Build personal knowledge networks:
- Each node is a concept/note
- Connections show relationships
- Spatial positioning adds meaning

### Brainstorming

Free-form idea mapping:
- Quick node creation (Alt+Shift+F)
- Drag to position
- Connect related ideas
- Organic, non-hierarchical layout

### Project Diagrams

Technical visualizations:
- System architecture
- Component relationships
- Workflow diagrams
- Entity relationships

## Tips and Tricks

### Organization

1. **Use spatial positioning** - Place related nodes near each other
2. **Leverage color** - Root nodes stand out automatically
3. **Group by proximity** - Create visual clusters
4. **Straight lines** - Show direct relationships clearly

### Workflow

1. **Start in Tree Mode** - Build hierarchical structure
2. **Switch to Graph Mode** - Get network view
3. **Reposition** - Adjust for clarity
4. **Toggle back** - See hierarchy again

### Visual Clarity

1. **Spread nodes out** - Avoid overlapping labels
2. **Use short labels** - Graph mode truncates at 150px
3. **Center key concepts** - Position important nodes prominently
4. **Follow connections** - Hover to highlight

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Quick add floating node** | Alt + Shift + F |
| **Add new root node** | Alt + Shift + N |
| **Reparent drag** | Hold Alt/Cmd while dragging |
| **Position drag** | Normal drag |
| **Toggle mode** | Via Settings (shortcut coming) |

## Technical Details

### CSS Classes

When Graph Mode is enabled:
- `.mm-mindmap` gets `.mm-graph-mode` class
- Circular node styling activates
- Label positioning enabled
- Line styling simplified

### Node Sizing

```css
Regular nodes: 16px × 16px circles
Second level:  20px × 20px circles
Root nodes:    24px × 24px circles
```

### Connection Lines

- **Tree Mode**: Cubic Bezier curves with control points
- **Graph Mode**: Simple `L` (line) SVG commands
- **Performance**: Graph mode slightly faster rendering

### Label Display

Uses CSS `::after` pseudo-element with `data-text` attribute:
```css
.mm-graph-mode .mm-node::after {
  content: attr(data-text);
  position: absolute;
  top: 24px;
  /* ... */
}
```

## Switching Modes

### What Happens When You Toggle

**Tree Mode → Graph Mode:**
1. Nodes become circles
2. Text moves to labels below
3. Lines become straight
4. Styling simplified
5. Positions preserved

**Graph Mode → Tree Mode:**
1. Circles become rounded rectangles
2. Text moves inside nodes
3. Lines become curved
4. Rich styling restored
5. Positions preserved

### What's Preserved

✅ **Preserved:**
- Node positions (floating nodes)
- Hierarchy (parent-child relationships)
- Node text and content
- Selection state
- All data

❌ **Not Preserved:**
- Visual appearance (nodes reshape)
- Line curvature (straight ↔ curved)
- Expand/collapse states (Graph mode shows all)

## Combining with Other Features

### Multi-Root Support

- Multiple root nodes work perfectly in Graph Mode
- Each root is a larger circle
- Create multiple graph clusters

### Floating Nodes

- All nodes are freely positionable
- Graph mode enhances this with cleaner visuals
- Create custom network layouts

### Quick Add

- Alt+Shift+F creates floating nodes
- They appear as circles in Graph Mode
- Position and connect as needed

## Limitations

### Current Limitations

1. **No expand/collapse** - Graph mode shows all nodes
2. **Fixed text truncation** - 150px max label width
3. **No physics simulation** - Manual positioning only
4. **Global setting** - Affects all mindmaps

### Future Enhancements

- [ ] Per-mindmap mode toggle
- [ ] Custom node sizes
- [ ] Adjustable label positioning
- [ ] Force-directed auto-layout
- [ ] Node grouping/clustering
- [ ] Custom connection styles

## Troubleshooting

**Q: Labels are cut off**
A: Graph mode truncates at 150px. Use shorter text or toggle to Tree Mode to see full text.

**Q: Can't see expand/collapse buttons**
A: Graph mode hides them - all nodes are always visible. Toggle to Tree Mode for collapse control.

**Q: Lines look jagged**
A: Graph mode uses straight lines intentionally. Toggle to Tree Mode for smooth curves.

**Q: How to toggle per-mindmap?**
A: Currently graph mode is global (affects all mindmaps). Per-mindmap toggle coming in future update.

**Q: Nodes overlapping**
A: Drag nodes to reposition. Graph mode requires manual layout for optimal spacing.

## Comparison: Graph Mode vs Obsidian Graph View

### Similarities ✅
- Circular nodes
- Straight connection lines
- Network-style visualization
- Minimalist aesthetic

### Differences
- **Graph View**: Shows note connections automatically
- **Mindmap Graph Mode**: Manual node creation and connection
- **Graph View**: Based on file links
- **Mindmap Graph Mode**: Based on parent-child hierarchy
- **Graph View**: Force-directed physics
- **Mindmap Graph Mode**: Manual positioning

### When to Use Each

**Obsidian Graph View:**
- Explore existing note connections
- Discover patterns in your vault
- Find related notes
- Automated layout

**Mindmap Graph Mode:**
- Build new concept networks
- Create structured diagrams
- Design custom layouts
- Manual control

---

**Enjoy the flexibility!** Switch between Tree and Graph modes to see your ideas from different perspectives. Each mode offers unique advantages for different thinking styles and use cases.
