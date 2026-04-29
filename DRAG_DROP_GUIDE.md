# Drag & Drop Guide

## 🎯 How to Rearrange Your Mindmap

The plugin now supports **intuitive drag-and-drop** for reorganizing your mindmap structure!

## ✨ New Features

### Always Draggable
- **All nodes are now draggable** - no need to select them first
- **Grab cursor** (✋) appears when hovering over nodes
- **Grabbing cursor** (✊) appears while dragging

### Visual Feedback
- **Semi-transparent dragged node** - shows what you're moving
- **Animated drop target** - dashed outline pulses on the destination node
- **Pulsing arrow indicator** - shows exactly where the node will be placed
- **Drag handle** - subtle vertical bar appears on hover (right side of nodes)

## 📖 How to Use

### Moving Nodes (Reparenting)

To move "Gen AI vs ETL" to become a child of "Data Framework":

1. **Hover** over "Gen AI vs ETL"
   - Cursor changes to ✋ (grab)

2. **Click and hold** the node
   - Node becomes semi-transparent
   - Cursor changes to ✊ (grabbing)

3. **Drag** to "Data Framework"
   - Arrow indicator appears showing drop position
   - Target node gets pulsing outline

4. **Release** the mouse button
   - Node is reparented!
   - Structure updates automatically
   - Changes save to markdown

### Drop Zones

When dragging over a node, you can drop in different positions:

```
    ┌─────────────┐
    │   [  Top  ] │  ← Drop here: Add as sibling ABOVE
    │   Target    │
    │   [Bottom ] │  ← Drop here: Add as sibling BELOW
    └─────────────┘
         ↓  ↓
    Left   Right   ← Drop here: Add as child (left/right direction)
```

#### **Sibling Placement** (Top/Bottom)
- Drop on **top half** of a node → placed ABOVE as sibling
- Drop on **bottom half** of a node → placed BELOW as sibling

#### **Child Placement** (Left/Right)
- Drop on **right edge** → added as child on right branch
- Drop on **left edge** → added as child on left branch
- Drop on **center** → added as child (default direction)

### Copy Instead of Move

Hold **Ctrl** (or **Cmd** on Mac) while dragging to **copy** the node instead of moving it!

```
Drag         = Move node
Ctrl + Drag  = Copy node
```

## 🎨 Visual Indicators

### During Drag:

| Element | Visual | Meaning |
|---------|--------|---------|
| **Dragged Node** | Semi-transparent, scaled down | The node you're moving |
| **Drop Target** | Pulsing dashed outline | Where you're about to drop |
| **Arrow Indicator** | Pulsing colored triangle | Exact drop position & relationship |
| **Cursor** | Grabbing (✊) | You're actively dragging |

### Arrow Indicator Meanings:

- **⬆️ Up Arrow** - Will be placed as sibling ABOVE
- **⬇️ Down Arrow** - Will be placed as sibling BELOW
- **➡️ Right Arrow** - Will be added as child on RIGHT
- **⬅️ Left Arrow** - Will be added as child on LEFT

## 🔧 Get Help

Run the command **"Show drag & drop help"** from the command palette (Ctrl/Cmd+P) to see a quick reference!

## 💡 Tips

1. **Hover first** - See the grab cursor before dragging
2. **Watch the arrow** - It shows exactly where the node will go
3. **Use drop zones** - Target specific areas for precise placement
4. **Hold Ctrl to copy** - Keep the original node in place
5. **Undo works** - Ctrl/Cmd+Z to undo any moves

## 📝 Example Workflow

### Move "Gen AI vs ETL" under "Data Framework":

1. Hover over "Gen AI vs ETL" → See ✋ cursor
2. Click and drag → Node becomes transparent
3. Drag over "Data Framework" → See pulsing outline
4. Position over the RIGHT side → See ➡️ arrow
5. Release mouse → "Gen AI vs ETL" is now a child of "Data Framework"!

### Result:
```
Before:
Root
├─ Gen AI vs ETL
└─ Data Framework

After:
Root
└─ Data Framework
   └─ Gen AI vs ETL
```

## 🚀 Quick Reference

| Action | How To |
|--------|--------|
| **Move node** | Drag and drop |
| **Copy node** | Ctrl + Drag and drop |
| **Add as sibling above** | Drop on top half |
| **Add as sibling below** | Drop on bottom half |
| **Add as child** | Drop on center/edges |
| **Undo move** | Ctrl/Cmd + Z |
| **Get help** | Command: "Show drag & drop help" |

## ✅ Benefits

- **Intuitive** - Works like you'd expect
- **Visual** - Clear feedback at every step
- **Precise** - Control exactly where nodes go
- **Flexible** - Move or copy with ease
- **Undoable** - Mistakes are easily reversible

Happy organizing! 🎉
